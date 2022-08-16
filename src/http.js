// @ts-nocheck
import { report, decode } from './util'

// 处理请求拦截和请求异常
export default function () {
  rewriteXML() // 重写XMLHttpRequest
  window.fetch && rewriteFeact() // 重写fetch
}

export const originXML = {}

// 重写XMLHttpRequest
function rewriteXML() {
  // 保存原方法
  const originalOpen = XMLHttpRequest.prototype.open
  const originalSend = XMLHttpRequest.prototype.send
  originXML.open = originalOpen
  originXML.send = originalSend
  const originalProto = XMLHttpRequest.prototype
  // 记录请求方法与请求路径
  let cacheWay, cacheUrl
  // 重写open方法
  originalProto.open = function newOpen() {
    cacheWay = arguments[0].toUpperCase()
    cacheUrl = formatUrl(arguments[1])
    return originalOpen.apply(this, arguments)
  }
  // 重写send方法
  originalProto.send = function newSend() {
    const startTime = Date.now()
    // 立刻保存url和way，避免请求回来前发下一个请求，被覆盖
    const url = cacheUrl
    const way = cacheWay
    const onLoadend = function () {
      // 采集请求数据
      // console.log(this)
      const endTime = Date.now()
      const success = isSuccess(this.status)
      const reportData = {
        kind: 3,
        time: startTime,
        send_url: url,
        way,
        success: success ? 0 : 1,
        status: this.status,
        res_time: endTime - startTime,
        res_body: this.response ? this.response : this.statusText,
      }
      report(reportData) // 上报日志
      // console.log(reportData)
      this.removeEventListener('loadend', onLoadend, true)

      // 请求失败，上报接口异常
      if (!success) {
        const reportData = {
          kind: 0,
          type: 2,
          time: endTime,
          message: `${this.status} ${this.statusText}`,
          stack: `Failed when requesting ${url}`,
        }
        // console.log(reportData)
        report(reportData)
      }
    }

    this.addEventListener('loadend', onLoadend, true)
    return originalSend.apply(this, arguments)
  }
}

// 重写fetch函数
function rewriteFeact() {
  const originalFetch = window.fetch
  window.fetch = function newFetch(url, config) {
    const startTime = Date.now()
    return originalFetch(url, config).then(function (res) {
      // 采集请求数据
      res
        .clone() // 返回数据只能读取一次，需要先克隆
        .text() // 转换成文本
        .then(function (data) {
          const endTime = Date.now()
          const success = isSuccess(res.status)
          const reportData = {
            kind: 3,
            time: startTime,
            send_url: res.url,
            way: (config ? config.method : 'GET').toUpperCase(),
            success: success ? 0 : 1,
            status: res.status,
            res_time: endTime - startTime,
            res_body: data,
          }
          // console.log(reportData)
          report(reportData) // 上报日志

          // 采集接口异常
          if (!success) {
            const reportData = {
              kind: 0,
              type: 2,
              time: endTime,
              message: `${res.status} ${res.statusText}`,
              stack: `Failed when requesting ${res.url}`,
            }
            // console.log(reportData)
            report(reportData) // 上报日志
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
    return decode(location.origin) + url
  } else {
    return decode(location.origin) + '/' + url
  }
}
