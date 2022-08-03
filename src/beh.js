import { report } from './util'

const areaList = {
  未知: 0,
  吉林: 1,
  台湾: 2,
  福建: 3,
  甘肃: 4,
  安徽: 5,
  北京: 6,
  江苏: 7,
  上海: 8,
  重庆: 9,
  河北: 10,
  河南: 11,
  湖南: 12,
  湖北: 13,
  浙江: 14,
  江西: 15,
  陕西: 16,
  山东: 17,
  山西: 18,
  黑龙江: 19,
  青海: 20,
  辽宁: 21,
  云南: 22,
  海南: 23,
  四川: 24,
  广东: 25,
  广西: 26,
  宁夏: 27,
  西藏: 28,
  新疆: 29,
  内蒙古: 30,
  香港: 31,
  澳门: 32,
  天津: 33,
  贵州: 34,
}

export default function () {
  const browser = getBrowser()
  let ip = '0.0.0.0',
    area = 0
  getIp()
  let startTime = Date.now()
  window.addEventListener('hashchange', (e) => {
    console.log(e)
    const endTime = Date.now()
    const reportData = {
      kind: 2,
      time: endTime,
      duration: endTime - startTime,
      browser,
      ip,
      area,
    }
    console.log(reportData)
    report(reportData)
    startTime = endTime
  })
  window.addEventListener('beforeunload', () => {
    const endTime = Date.now()
    const reportData = {
      kind: 2,
      time: endTime,
      duration: endTime - startTime,
      browser,
      ip,
      area,
    }
    report(reportData)
  })

  function getIp() {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'http://pv.sohu.com/cityjson'
    document.head.appendChild(script)
    script.onload = function () {
      ip = returnCitySN.cip
      area = areaList[returnCitySN.cname.slice(0, 2)] || 0
      // console.log(returnCitySN)
    }
  }
}
function getBrowser() {
  // 获取浏览器 userAgent
  var ua = navigator.userAgent
  // 是否为 Opera
  var isOpera = ua.indexOf('Opera') > -1
  // 返回结果
  if (isOpera) {
    return 5 // Opera
  }

  // 是否为 IE
  var isIE = ua.indexOf('compatible') > -1 && ua.indexOf('MSIE') > -1 && !isOpera
  var isIE11 = ua.indexOf('Trident') > -1 && ua.indexOf('rv:11.0') > -1
  // 返回结果
  if (isIE11 || isIE) {
    return 4 // IE11
  }

  // 是否为 Edge
  var isEdge = ua.indexOf('Edg') > -1
  // 返回结果
  if (isEdge) {
    return 2 // Edge
  }

  // 是否为 Firefox
  var isFirefox = ua.indexOf('Firefox') > -1
  // 返回结果
  if (isFirefox) {
    return 3 // Firefox
  }

  // 是否为 Safari
  var isSafari = ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') == -1
  // 返回结果
  if (isSafari) {
    return 6 // Safari
  }

  // 是否为 Chrome
  var isChrome = ua.indexOf('Chrome') > -1 && ua.indexOf('Safari') > -1 && ua.indexOf('Edge') == -1
  // 返回结果
  if (isChrome) {
    return 1 // Chrome
  }

  return 0 // 其他
}
