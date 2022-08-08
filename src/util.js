import { originXML } from './http'
const _XMLHttpRequest = window.XMLHttpRequest

let web_id = 1018
let closeDebug = false
window.setOption = function (option = {}) {
  web_id = option.id || 1018
  closeDebug = option.closeDebug
}

export const decode = function (url) {
  return decodeURIComponent(url)
}
export function report(data) {
  data.web_id = web_id
  data.url = decode(location.hostname) + decode(location.pathname)
  !closeDebug && console.dir(data)
  // const url = '/database'
  let url = 'http://47.100.57.184:3333/report/'
  switch (data.kind) {
    case 0:
      url += 'err'
      break
    case 1:
      url += 'per'
      break
    case 2:
      url += 'beh'
      break
    case 3:
      url += 'http'
      break
  }
  const xhr = new _XMLHttpRequest()
  originXML.open.call(xhr, 'POST', url, true)
  originXML.send.call(xhr, JSON.stringify(data))
  // xhr.open('POST', url, true)
  // xhr.send(data)
}
