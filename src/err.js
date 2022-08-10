// @ts-nocheck
import { report } from './util'
import { originXML } from './http'

export default function () {
  // 监控脚本异常与资源加载异常
  window.addEventListener(
    'error',
    function (e) {
      // console.log(e)
      let reportData
      // 资源加载异常
      if (e.target && (e.target.src || e.target.href)) {
        const fileName = getErrorFileName(e.target.src || e.target.href)
        reportData = {
          kind: 0,
          type: 1,
          time: Date.now(),
          message: `Not Found: ${fileName}`,
          stack: `Not Found: ${e.target.src || e.target.href}`,
        }
        // console.dir(e.target)
      } else {
        // 脚本异常
        // console.log(e)
        reportData = {
          kind: 0,
          type: 0,
          time: Date.now(),
          message: e.error.name + ': ' + e.error.message,
          stack: formatErrorStack(e.error.stack),
        }
      }
      report(reportData) // 上报日志
      // console.log(reportData)
      // e.preventDefault()
    },
    true
  )
  // promise异常，归到脚本异常
  window.addEventListener(
    'unhandledrejection',
    function (e) {
      const reportData = {
        kind: 0,
        type: 0,
        time: Date.now(),
        message: e.reason.name + ': ' + e.reason.message,
        stack: formatErrorStack(e.reason.stack),
      }
      report(reportData)
      // console.log(reportData)
      // e.preventDefault()
    },
    true
  )

  // 资源加载异常 额外处理css中的异常
  window.addEventListener('load', function () {
    // 通过再发一次请求验证
    // 提取所有资源列表并过滤
    const entries = performance.getEntriesByType('resource')
    const srcEntries = entries.filter(function (val) {
      return val.initiatorType == 'css'
    })
    // 重发请求
    for (const item of srcEntries) {
      const xhr = new XMLHttpRequest()
      originXML.open.call(xhr, 'GET', item.name)
      originXML.send.call(xhr)

      function onLoadend() {
        if (isSuccess(xhr.status)) {
          return
        }
        // 请求失败 记录为资源异常
        const reportData = {
          kind: 0,
          type: 1,
          time: Date.now(),
          message: `Not Found: ${getErrorFileName(item.name)}`,
          stack: `Not Found: ${item.name}`,
        }
        // console.log(reportData)
        report(reportData)
      }
      xhr.addEventListener('loadend', onLoadend)
    }
  })

  // 白屏异常
  setTimeout(function () {
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
        type: 3,
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
  }, 3000)
}

// 处理堆栈信息
function formatErrorStack(stack) {
  if (!stack) return ''
  const arr = stack.split('\n')
  return arr
    .slice(1)
    .map(function (str) {
      return str.trim()
    })
    .join(' ^ ')
}

// 获取资源异常的文件名
function getErrorFileName(src) {
  if (!src) return ''
  const arr = src.split('/')
  return arr[arr.length - 1]
}

// 检测请求是否成功
function isSuccess(status) {
  return status < 400
}
