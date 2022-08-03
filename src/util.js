let web_id = -1
export function getWebId() {
  return web_id
}

export function setWebId(id) {
  web_id = id
}

export function report(data) {
  const url = '/database'
  const xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.send(data)
}
