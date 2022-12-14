// @ts-nocheck
import { report, decode } from './util'

// 地区映射
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
  黑龙: 19,
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
  内蒙: 30,
  香港: 31,
  澳门: 32,
  天津: 33,
  贵州: 34,
}

export default function () {
  // 访问时间
  let startTime = Date.now()
  // 记录当前路径
  let preUrl = decode(location.hostname + location.pathname + location.hash)
  // 获取当前用户状态
  const user = getUser()
  // 获取当前浏览器类型
  const browser = getBrowser()
  // 获取ip和地址
  let ip = '0.0.0.0',
    area = 0
  getIp()
  // 重写history的pushState和replaceState
  rewriteHistory()

  let sign = true // 节流，避免重复上报
  // 页面改变时的回调
  function pageChangeHandler() {
    if (!sign) return
    sign = false
    setTimeout(function () {
      sign = true
    }, 100)

    const endTime = Date.now() // 离开时间
    const reportData = {
      kind: 2, // 行为日志
      time: endTime, // 上报事件
      url: preUrl, // 页面路径
      duration: endTime - startTime, // 停留时间
      browser, // 用户浏览器
      ip, // 用户ip
      area, // 用户地区
      user, // 区分pv/uv
    }
    report(reportData) // 上报日志
    // 更新时间与路径
    startTime = endTime
    preUrl = decode(location.hostname + location.pathname + location.hash)
  }
  // 监听各种事件
  window.addEventListener('hashchange', pageChangeHandler, {
    capture: true,
    passive: true,
  })
  window.addEventListener('pushState', pageChangeHandler, {
    capture: true,
    passive: true,
  })
  window.addEventListener('replaceState', pageChangeHandler, {
    capture: true,
    passive: true,
  })
  window.addEventListener('popstate', pageChangeHandler, {
    capture: true,
    passive: true,
  })
  window.addEventListener('beforeunload', pageChangeHandler, {
    capture: true,
    passive: true,
  })

  // 借助sohu获取ip与地区
  function getIp() {
    // 规避跨域问题
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'http://pv.sohu.com/cityjson'
    document.head.appendChild(script)

    script.onload = function () {
      // js执行完，获取ip与地区
      if (returnCitySN && returnCitySN.cip) {
        ip = returnCitySN.cip
      }
      if (returnCitySN && returnCitySN.cname) {
        area = areaList[returnCitySN.cname.slice(0, 2)] || 0
      }
    }
  }

  // 重写history的pushState和replaceState
  function rewriteHistory() {
    const prePushState = history.pushState
    history.pushState = function () {
      const res = prePushState.apply(this, arguments)
      pageChangeHandler()
      return res
    }
    const preReplaceState = history.replaceState
    history.replaceState = function () {
      const res = preReplaceState.apply(this, arguments)
      pageChangeHandler()
      return res
    }
  }
}

// 获取浏览器类型
function getBrowser() {
  // 获取浏览器 userAgent
  const ua = navigator.userAgent
  // 是否为 Opera
  const isOpera = ua.indexOf('Opera') > -1
  if (isOpera) {
    return 5 // Opera
  }

  // 是否为 IE
  const isIE = ua.indexOf('compatible') > -1 && ua.indexOf('MSIE') > -1 && !isOpera
  const isIE11 = ua.indexOf('Trident') > -1 && ua.indexOf('rv:11.0') > -1
  if (isIE11 || isIE) {
    return 4 // IE11
  }

  // 是否为 Edge
  const isEdge = ua.indexOf('Edg') > -1
  if (isEdge) {
    return 2 // Edge
  }

  // 是否为 Firefox
  const isFirefox = ua.indexOf('Firefox') > -1
  if (isFirefox) {
    return 3 // Firefox
  }

  // 是否为 Safari
  const isSafari = ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') == -1
  if (isSafari) {
    return 6 // Safari
  }

  // 是否为 Chrome
  const isChrome = ua.indexOf('Chrome') > -1 && ua.indexOf('Safari') > -1 && ua.indexOf('Edge') == -1
  if (isChrome) {
    return 1 // Chrome
  }

  return 0 // 其他
}

// 获取当前用户状态
// 0新用户；
// 1老用户今日首次登录；
// 2老用户今日再次登录
function getUser() {
  const key = '__user__'
  let time = localStorage.getItem(key)
  let res
  if (!time) {
    res = 0 // 新用户
  } else {
    const d1 = new Date(parseInt(time))
    const d2 = new Date()
    if (d1.getDay() == d2.getDay() && d1 - d2 < 24 * 3600 * 1000) {
      res = 2 // 老用户今日再次登录
    } else {
      res = 1 // 老用户今日首次登录
    }
  }
  // 更新数据
  localStorage.setItem(key, Date.now().toString())
  return res
}
