import { report } from './util'
import { originXML } from './http'

export default function () {
  window.addEventListener(
    'error',
    (e) => {
      // console.log(e)
      let reportData
      // 资源加载异常
      if (e.target && (e.target.src || e.target.href)) {
        const src = getErrorSrc(e.target.src || e.target.href)
        reportData = {
          kind: 0,
          type: 1,
          time: Date.now(),
          message: `Not Found: ${src}`,
          stack: `Not Found: ${e.target.src || e.target.href}`,
        }
        // console.dir(e.target)
      } else {
        // js异常
        reportData = {
          kind: 0,
          type: 0,
          time: Date.now(),
          message: getErrorType(e.error.stack) + e.error.message,
          stack: formatErrorStack(e.error.stack),
        }
      }
      report(reportData)
      // console.log(reportData)
      // e.preventDefault()
    },
    true
  )
  // promise异常
  window.addEventListener(
    'unhandledrejection',
    (e) => {
      const reportData = {
        kind: 0,
        type: 0,
        time: Date.now(),
        message: getErrorType(e.reason.stack) + e.reason.message,
        stack: formatErrorStack(e.reason.stack),
      }
      // console.log(reportData)
      report(reportData)
      // e.preventDefault()
    },
    true
  )

  setTimeout(() => {
    // 白屏异常
    const width = window.innerWidth
    const height = window.innerHeight
    let emptyPoints = 18
    for (let i = 1; i < 10; i++) {
      isWapper(document.elementsFromPoint(width / 2, (height / 10) * i)[0])
      isWapper(document.elementsFromPoint((width / 10) * i, height / 2)[0])
    }
    // 全屏没有元素，触发白屏异常
    if (emptyPoints == 18) {
      const reportData = {
        kind: 0,
        type: 0,
        time: Date.now(),
        message: 'White screen',
        stack: 'No DOM rendering for three seconds',
      }
      // console.log(reportData)
      report(reportData)
    }
    function isWapper(dom) {
      const tagName = dom.tagName
      if (tagName != 'HTML' && tagName != 'BODY') {
        emptyPoints--
      }
    }

    // 资源加载异常 格外处理css中的异常
    // 通过再发一次请求验证
    const entries = performance.getEntriesByType('resource')
    const srcEntries = entries.filter((val) => val.initiatorType == 'css')
    for (const item of srcEntries) {
      const xhr = new XMLHttpRequest()
      originXML.open.call(xhr, 'GET', item.name)
      originXML.send.call(xhr)

      function onLoadend() {
        if (isSuccess(xhr.status)) {
          return
        }
        // 请求失败
        const reportData = {
          kind: 0,
          type: 1,
          time: Date.now(),
          message: `Not Found: ${getErrorSrc(item.name)}`,
          stack: `Not Found: ${item.name}`,
        }
        // console.log(reportData)
        report(reportData)
      }
      xhr.addEventListener('loadend', onLoadend)
    }
  }, 1000)
}

function getErrorType(stack) {
  return stack.split(':')[0] + ': '
}

function formatErrorStack(stack) {
  const arr = stack.split('\n')
  return arr
    .slice(1)
    .map((str) => str.trim())
    .join(' ^ ')
}

function getErrorSrc(src) {
  const arr = src.split('/')
  return arr[arr.length - 1]
}

// 检测请求是否成功
function isSuccess(status) {
  return status < 400
}
