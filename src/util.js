let web_id = -1
export function getWebId() {
  return web_id
}

export function setWebId(id) {
  web_id = id
}

export function report(data) {
  data.web_id = web_id
  data.url = location.hostname + location.pathname
  const url = '/database'
  const xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.send(data)
  // xhr.send()
}
