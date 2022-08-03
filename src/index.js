function createHistoryEvent(type) {
  const origin = history[type]

  return function () {
    const res = origin.apply(this, arguments)

    const e = new Event(type)

    window.dispatchEvent(e)

    return res
  }
}

export default class Tracker {
  config = {}

  // requestUrl默认为我们自己的后端请求地址，用户可能并不想把数据发给我们使用我们的监控系统，他可能只是借用我们的sdk搜集数据
  // 然后把数据存储到用户自己的数据库，所以在初始化Tracker实例的时候，允许用户传自己的url来覆盖我们的url
  constructor(options) {
    if (!options.requestUrl)
      options.requestUrl = 'http://localhost:3000/report/error'
    this.config = Object.assign(this.#initdef(), options)
    this.#installTracker()
  }

  static complete(requestUrl) {
    return new Tracker({
      requestUrl,
      historyTracker: true,
      hashTracker: true,
      jsErrorTracker: true,
      resourceLoadTracker: true,
      requestTracker: true,
      performanceTracker: true
    })
  }

  // 这个私有方法返回默认配置
  #initdef() {
    return {
      sdkVersion: '1.0.0', //默认sdk版本
      historyTracker: false, //默认不开启监控history模式下路由跳转
      hashTracker: false, //默认不开启监控hash模式下路由跳转
      jsErrorTracker: false, //默认不开启监控js错误（包括promise）
      resourceLoadTracker: false, // 默认不开启监控资源加载
      requestTracker: false, //默认不开启监控接口请求
      performanceTracker: false //默认不开启监控页面性能
    }
  }

  // 根据EventList添加事件监听器，在callback中组装上报信息
  #captureEvents(EventList) {
    EventList.forEach(event => {
      if (['pushState', 'replaceState', 'popstate'].includes(event)) {
        window.addEventListener(event, evt => {
          this.#reportTracker({
            subType: 'behavior-historyPV', //信息的分类
            event //标识是触发了哪个事件引起的信息上报，便于后期维护
          })
        })
      }

      if (['hashchange'].includes(event)) {
        window.addEventListener(event, evt => {
          this.#reportTracker({
            subType: 'behavior-hashPV', //信息的分类
            event //标识是触发了哪个事件引起的信息上报，便于后期维护
          })
        })
      }

      if (['error', 'unhandledrejection'].includes(event)) {
        if (event === 'error') {
          let originalOnError = window.onerror
          window.onerror = (message, source, lineno, colno, error) => {
            if (originalOnError) {
              try {
                originalOnError.call(
                  window,
                  message,
                  source,
                  lineno,
                  colno,
                  error
                )
              } catch (err) {}
            }

            if (error != null) {
              // 上报脚本错误
              this.#reportTracker({
                message, //错误信息
                line: '' + (lineno || ''), //错误所在行号
                col: '' + (colno || ''), //错误所在列号
                stack: error.stack
                  ? error.stack.split('at').map(item => item.trim())
                  : '', // 错误的堆栈信息
                subType: 'error-jsError', //信息的分类
                event //标识是触发了哪个事件引起的信息上报，便于后期维护
              })
            }
            // 使控制台不飘红
            return true
          }
        } else {
          window.addEventListener('unhandledrejection', evt => {
            evt.promise.catch(error => {
              this.#reportTracker({
                reason: error,
                message:
                  'No callback function was specified for the failed Promise',
                subType: 'error-promiseReject', //信息的分类
                event //标识是触发了哪个事件引起的信息上报，便于后期维护
              })
            })
          })
        }
      }

      if (['resource'].includes(event)) {
        const resourceErrorList = []
        // 绑定一个事件监听器，专门监听那些加载失败的资源的url，将url加入列表中
        window.addEventListener(
          'error',
          evt => {
            if (evt.target instanceof HTMLElement) {
              resourceErrorList.push(evt.target.currentSrc)
            }
          },
          true
        )

        const self = this
        function reportAssets() {
          const entries = performance.getEntriesByType('resource')

          // 过滤掉非静态资源的 performance entry
          const resourceEntries = entries.filter(
            entry =>
              ['fetch', 'xmlhttprequest', 'beacon'].indexOf(
                entry.initiatorType
              ) === -1
          )

          // 上报
          if (resourceEntries.length) {
            resourceEntries.forEach(entry => {
              let status = resourceErrorList.includes(entry.name)
                ? 'Failed'
                : 'Success'
              self.#reportTracker({
                resourceType: entry.initiatorType, //资源的类型
                duration: entry.duration, //资源加载的耗时
                status, //资源加载成功与否
                src_href: entry.name, //资源请求的src或者href
                subType: 'performance-resourceLoad', //信息的分类
                event //标识是触发了哪个事件引起的信息上报，便于后期维护
              })
            })
          }

          // 清空这一轮所取到的 performance entry
          performance.clearResourceTimings()

          // 可定时2秒收集一次
          setTimeout(reportAssets, 2000)
        }

        // 当页面 DOM ready 或 onload 时，就可以触发收集一轮资源加载的日志
        if (document.readyState === 'complete') {
          reportAssets()
        } else {
          window.addEventListener('load', reportAssets)
        }
      }

      if (['XMLHttpRequest', 'fetch'].includes(event)) {
        let self = this
        if (event === 'XMLHttpRequest') {
          let originalOpen = XMLHttpRequest.prototype.open
          let originalSend = XMLHttpRequest.prototype.send
          let originalProto = XMLHttpRequest.prototype
          originalProto.open = function newOpen(...args) {
            this.method = args[0]
            this.url = args[1]
            originalOpen.apply(this, args)
          }

          originalProto.send = function newSend(...args) {
            this.startTime = Date.now()

            const onLoadend = () => {
              this.endTime = Date.now()
              this.duration = this.endTime - this.startTime

              const { status, duration, startTime, endTime, url, method } = this

              self.#reportTracker({
                duration,
                startTime,
                endTime,
                req_url: url,
                method: (method || 'GET').toUpperCase(),
                status: status >= 200 && status < 300 ? 'Success' : 'Failed',
                subType: 'performance-XMLHttpRequest', //信息的分类
                event //标识是触发了哪个事件引起的信息上报，便于后期维护
              })

              this.removeEventListener('loadend', onLoadend, true)
            }

            this.addEventListener('loadend', onLoadend, true)
            originalSend.apply(this, args)
          }
        } else {
          const originalFetch = window.fetch

          // 重写原始fetch请求
          function overwriteFetch() {
            window.fetch = function newFetch(url, config) {
              // 构建上报信息
              const startTime = Date.now()
              const reportData = {
                startTime,
                req_href: url,
                method: (config?.method || 'GET').toUpperCase(),
                subType: 'performance-fetch', //信息的分类
                event //标识是触发了哪个事件引起的信息上报，便于后期维护
              }

              return originalFetch(url, config)
                .then(res => {
                  // 请求成功了进这里
                  reportData.endTime = Date.now()
                  reportData.duration =
                    reportData.endTime - reportData.startTime

                  reportData.status = 'Success'

                  self.#reportTracker(reportData)

                  return res
                })
                .catch(err => {
                  // 请求失败了进这里
                  reportData.endTime = Date.now()
                  reportData.duration =
                    reportData.endTime - reportData.startTime
                  reportData.status = 'Failed'

                  self.#reportTracker(reportData)

                  throw err
                })
            }
          }
          overwriteFetch()
        }
      }

      if (['FP', 'FCP', 'LCP'].includes(event)) {
        let self = this
        if (event === 'FP') {
          const observer = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-paint') {
                observer.disconnect()
                self.#reportTracker({
                  FP: entry.startTime,
                  subType: 'performance-FP', //信息的分类
                  event //标识是触发了哪个事件引起的信息上报，便于后期维护
                })
              }
            }
          })
          observer.observe({ type: 'paint', buffered: true })
        } else if (event === 'FCP') {
          const observer = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                observer.disconnect()
                self.#reportTracker({
                  FCP: entry.startTime,
                  subType: 'performance-FCP', //信息的分类
                  event //标识是触发了哪个事件引起的信息上报，便于后期维护
                })
              }
            }
          })
          observer.observe({ type: 'paint', buffered: true })
        } else if (event === 'LCP') {
          const observer = new PerformanceObserver(list => {
            if (observer) {
              observer.disconnect()
            }

            for (const entry of list.getEntries()) {
              self.#reportTracker({
                LCP: entry.startTime,
                subType: 'performance-LCP', //信息的分类
                event //标识是触发了哪个事件引起的信息上报，便于后期维护
              })
            }
          })
          observer.observe({ type: 'largest-contentful-paint', buffered: true })
        }
      }
    })
  }

  // 安装监控
  #installTracker() {
    // 根据初始化监控器的配置，明确用户需要哪些监控功能，再安装对应的监控

    // historyTracker 监控路由在history模式下的跳转
    if (this.config.historyTracker) {
      window.history['pushState'] = createHistoryEvent('pushState')
      window.history['replaceState'] = createHistoryEvent('replaceState')
      this.#captureEvents(['pushState', 'replaceState', 'popstate'])
    }

    // hashTracker 监控路由在hash模式下的跳转
    if (this.config.hashTracker) {
      window.history['pushState'] = createHistoryEvent('pushState')
      window.history['replaceState'] = createHistoryEvent('replaceState')
      this.#captureEvents(['hashchange'])
    }

    // jsErrorTracker 监控JS错误（包括promise错误）
    if (this.config.jsErrorTracker) {
      this.#captureEvents(['error', 'unhandledrejection'])
    }

    // resourceLoadTracker 监控所有资源加载，无论加载成功与否都会被监控到
    if (this.config.resourceLoadTracker) {
      this.#captureEvents(['resource'])
    }

    // requestTracker 监控所有AJAX请求和fetch请求，无论加载成功与否都会被监控到
    if (this.config.requestTracker) {
      this.#captureEvents(['XMLHttpRequest', 'fetch'])
    }

    // performanceTracker  监控页面加载的性能数据FP、FCP、LCP、CLS
    // FP   从页面加载开始到第一个像素绘制到屏幕上的时间。其实把 FP 理解成白屏时间也是没问题的
    // FCP  从页面加载开始到页面内容的任何部分在屏幕上完成渲染的时间
    // LCP  从页面加载开始到最大文本块或图像元素在屏幕上完成渲染的时间
    if (this.config.performanceTracker) {
      this.#captureEvents(['FP', 'FCP', 'LCP'])
    }
  }

  // 上报信息
  #reportTracker(data) {
    const params = Object.assign(
      // 默认会有的字段
      {
        sdkVersion: this.config.sdkVersion, //sdk版本
        uuid: this.config.uuid || '', //用户uuid，用于分析UV
        reportTime: Date.now(), //信息上报的时间
        extra: this.config.extra || '', // 用户自定义上报的信息
        url: location.href //上报信息源url
      },
      data
    )

    navigator.sendBeacon(this.config.requestUrl, new URLSearchParams(params))
  }

  // 暴露给用户的方法，用户可以通过这个方法设置用户的uuid，在上报的时候，如果不为空就上报
  setUUID(id) {
    this.config.uuid = id
  }

  // 暴露给用户的方法，用户可以通过这个方法设置额外信息，额外信息会跟随每一条上报的信息一起上报
  setExtra(extra) {
    this.config.extra = extra
  }

  // 暴露给用户的方法，用户可以通过这个方法上报一些信息
  sendTracker(data) {
    this.#reportTracker({ subType: 'self-report', ...data })
  }

  // 暴露给用户的方法，用户可以通过这个方法设置上报信息的接口
  setRequestUrl(requestUrl) {
    this.config.requestUrl = requestUrl
  }
}
