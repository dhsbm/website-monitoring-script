// @ts-nocheck
import { originXML } from './http'
// 缓存 XMLHttpRequest 避免被mock修改
const _XMLHttpRequest = window.XMLHttpRequest

let web_id = 1018
let showDebug = true
// 公开选项设置
window.setOption = function (option = {}) {
  web_id = option.id || 1018
  showDebug = !!option.showDebug
}
// 解码中文路径
export const decode = function (url) {
  return decodeURIComponent(url)
}
// 上报日志
export function report(data) {
  data.web_id = web_id
  // 采集路径，行为日志需要使用跳转前的路径
  if (data.kind != 2) data.url = decode(location.hostname + location.pathname + location.hash)

  // const url = '/database'
  let tip = ''
  let url = 'http://47.100.57.184:3333/report/' // 上报路径
  // 根据错误类型，请求发往不同的路径
  switch (data.kind) {
    case 0:
      url += 'err'
      tip = 'err: '
      break
    case 1:
      url += 'per'
      tip = 'per: '
      break
    case 2:
      url += 'beh'
      tip = 'beh: '
      break
    case 3:
      url += 'http'
      tip = 'http: '
      break
  }
  if (showDebug) {
    console.log(tip, data)
  }
  // 避免无限请求，使用原生方法
  const xhr = new _XMLHttpRequest()
  originXML.open.call(xhr, 'POST', url, true)
  originXML.send.call(xhr, JSON.stringify(data))
}
