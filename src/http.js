import { getWebId, report } from './util'

// 处理请求拦截和请求异常
export default function () {
  rewriteXML()
  window.fetch && rewriteFeact()
}
// 重写XMLHttpRequest
function rewriteXML() {
  const originalOpen = XMLHttpRequest.prototype.open
  const originalSend = XMLHttpRequest.prototype.send
  const originalProto = XMLHttpRequest.prototype
  let cacheWay, cacheUrl
  // 重写open方法
  originalProto.open = function newOpen(...args) {
    cacheWay = args[0].toUpperCase()
    cacheUrl = formatUrl(args[1])
    return originalOpen.apply(this, args)
  }
  // 重写send方法
  originalProto.send = function newSend(...args) {
    const startTime = Date.now()
    // 立刻读取url和way，省的请求回来前发了下一个请求，被覆盖
    const url = cacheUrl
    const way = cacheWay
    const onLoadend = () => {
      // 采集请求数据
      const endTime = Date.now()
      const success = isSuccess(this.status)
      const reportData = {
        web_id: getWebId(),
        kind: 3,
        url: location.hostname + location.pathname,
        time: startTime,
        send_url: url,
        way,
        success,
        status: this.status,
        res_time: endTime - startTime,
        res_body: this.response ? JSON.stringify(this.response) : this.statusText,
      }
      if (url.indexOf('database') == -1) {
        console.log(reportData)
        report(reportData)
      }
      this.removeEventListener('loadend', onLoadend, true)

      // 上报接口异常
      if (!success) {
        const reportData = {
          web_id: getWebId(),
          kind: 0,
          url: location.hostname + location.pathname,
          type: 2,
          time: endTime,
          message: `${this.status} ${this.statusText}`,
          stack: `Failed when requesting ${url}`,
        }
        console.log(reportData)
        report(reportData)
      }
    }

    this.addEventListener('loadend', onLoadend, true)

    return originalSend.apply(this, args)
  }
}

// 重写feach
function rewriteFeact() {
  const originalFetch = window.fetch
  window.fetch = function newFetch(url, config) {
    const startTime = Date.now()
    return originalFetch(url, config).then((res) => {
      // 请求采集请求数据
      const endTime = Date.now()
      res.text().then((data) => {
        const success = isSuccess(res.status)
        const reportData = {
          web_id: getWebId(),
          kind: 3,
          url: location.hostname + location.pathname,
          time: startTime,
          send_url: res.url,
          way: (config?.method || 'GET').toUpperCase(),
          success: success,
          status: res.status,
          res_time: endTime - startTime,
          res_body: data,
        }
        console.log(reportData)
        report(reportData)

        // 采集接口异常
        if (!success) {
          const reportData = {
            web_id: getWebId(),
            kind: 0,
            url: location.hostname + location.pathname,
            type: 2,
            time: endTime,
            message: `${res.status} ${res.statusText}`,
            stack: `Failed when requesting ${res.url}`,
          }
          console.log(reportData)
          report(reportData)
        }
      })
      return res
    })
  }
}

// 检测请求是否成功
function isSuccess(status) {
  return status < 400
}

// 格式化请求路径
function formatUrl(url) {
  if (url.indexOf('http') != -1) {
    return url
  } else if (url[0] == '/') {
    return location.origin + url
  } else {
    return location.origin + '/' + url
  }
}
