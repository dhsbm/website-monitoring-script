import { report } from './util'

export default function () {
  window.addEventListener(
    'error',
    (e) => {
      console.log(e)

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
        console.dir(e.target)
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
      console.log(reportData)
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
      console.log(reportData)
      report(reportData)
      // e.preventDefault()
    },
    true
  )
  // 白屏异常
  setTimeout(() => {
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
      console.log(reportData)
      report(reportData)
    }
    function isWapper(dom) {
      const tagName = dom.tagName
      if (tagName != 'HTML' && tagName != 'BODY') {
        emptyPoints--
      }
    }
  }, 3000)
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
