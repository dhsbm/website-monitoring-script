import { originXML } from './http'

let web_id = -1

export function setWebId(id) {
  web_id = id
}

export function report(data) {
  console.log(data)
  data.web_id = web_id
  data.url = location.hostname + location.pathname
  const url = '/database'
  // const url = 'http://127.0.0.1/report'
  const xhr = new XMLHttpRequest()
  originXML.open.call(xhr, 'POST', url, true)
  originXML.send.call(xhr)
  // xhr.open('POST', url, true)
  // xhr.send(data)
}
