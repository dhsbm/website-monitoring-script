// @ts-nocheck
import { report, decode } from './util'

// 处理请求拦截和请求异常
export default function () {
  rewriteXML() // 重写XMLHttpRequest
  window.fetch && rewriteFetch() // 重写fetch
}

export const originXML = {}

// 重写XMLHttpRequest
function rewriteXML() {
  // 保存原方法
  const originalProto = XMLHttpRequest.prototype
  const originalOpen = originalProto.open
  const originalSend = originalProto.send
  // 向外暴露原生方法，供上报请求使用
  originXML.open = originalOpen
  originXML.send = originalSend
  // 记录请求方法
  let cacheWay
  // 重写open方法
  originalProto.open = function newOpen() {
    cacheWay = arguments[0].toUpperCase() // 请求方法
    return originalOpen.apply(this, arguments)
  }
  // 重写send方法
  originalProto.send = function newSend() {
    const startTime = Date.now() // 请求发出的时间
    // 立刻保存请方法，避免请求回来前发下一个请求，被覆盖
    const way = cacheWay
    this.addEventListener('loadend', onLoadend, true)
    return originalSend.apply(this, arguments)

    function onLoadend() {
      // 采集请求数据
      const endTime = Date.now() // 请求返回的时间
      const success = isSuccess(this.status) // 验证请求是否成功
      const reportData = {
        kind: 3, // 表示请求日志
        time: startTime, // 请求时间
        send_url: this.responseURL, // 请求路径
        way, // 请求方法
        success: success ? 0 : 1, // 请求是否成功
        status: this.status, // 状态码
        res_time: endTime - startTime, // 响应时间
        res_body: this.response ? this.response : this.statusText, // 响应信息
      }
      report(reportData) // 上报日志
      this.removeEventListener('loadend', onLoadend, true)

      // 请求失败，上报接口异常
      if (!success) {
        const reportData = {
          kind: 0, // 异常日志
          type: 2, // 接口异常
          time: endTime, // 异常的发生时间
          message: `${this.status} ${this.statusText}`, // 报错信息
          stack: `Failed when requesting ${this.responseURL}`, // 异常堆栈
        }
        report(reportData)
      }
    }
  }
}

// 重写fetch函数
function rewriteFetch() {
  const originalFetch = window.fetch // 保留原生方法
  window.fetch = function newFetch(url, config) {
    const startTime = Date.now() // 请求发起的时间
    return originalFetch(url, config).then(function (res) {
      // 采集请求数据
      res
        .clone() // 返回数据只能读取一次，需要先克隆
        .text() // 转换成文本
        .then(function (data) {
          const endTime = Date.now() // 请求返回的时间
          const success = isSuccess(res.status) // 验证请求是否成功
          const reportData = {
            kind: 3, // 表示请求日志
            time: startTime, // 请求时间
            send_url: res.url, // 请求路径
            way: (config ? config.method : 'GET').toUpperCase(), // 请求方法
            success: success ? 0 : 1, // 请求是否成功
            status: res.status, // 状态码
            res_time: endTime - startTime, // 响应时间
            res_body: data, // 响应信息
          }
          report(reportData) // 上报日志

          // 采集接口异常
          if (!success) {
            const reportData = {
              kind: 0, // 异常日志
              type: 2, // 接口异常
              time: endTime, // 异常的发生时间
              message: `${res.status} ${res.statusText}`, // 报错信息
              stack: `Failed when requesting ${res.url}`, // 异常堆栈
            }
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
