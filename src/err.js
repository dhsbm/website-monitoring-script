// @ts-nocheck
import { report } from './util'
import { originXML } from './http'

export default function () {
  // 监控脚本异常与资源加载异常
  window.addEventListener(
    'error',
    function (e) {
      let reportData
      if (e.target && (e.target.src || e.target.href)) {
        // 资源加载异常
        const fileName = getErrorFileName(e.target.src || e.target.href)
        reportData = {
          kind: 0, // 异常日志
          type: 1, // 资源异常
          time: Date.now(), // 异常的发生时间
          message: `Not Found: ${fileName}`, // 报错信息
          stack: `Not Found: ${e.target.src || e.target.href}`, // 异常堆栈
        }
      } else {
        // 脚本异常
        reportData = {
          kind: 0, // 异常日志
          type: 0, // 脚本异常
          time: Date.now(), // 异常的发生时间
          message: e.error.name + ': ' + e.error.message, // 报错信息
          stack: formatErrorStack(e.error.stack), // 堆栈信息
        }
      }
      report(reportData) // 上报日志
    },
    true
  )
  // promise异常，归到脚本异常
  window.addEventListener(
    'unhandledrejection',
    function (e) {
      const reportData = {
        kind: 0, // 异常日志
        type: 0, // 脚本异常
        time: Date.now(), // 异常的发生时间
        message: e.reason.name + ': ' + e.reason.message, // 报错信息
        stack: formatErrorStack(e.reason.stack), // 堆栈信息
      }
      report(reportData)
    },
    true
  )

  // 额外处理css中的资源异常，通过再发一次请求验证
  window.addEventListener('load', function () {
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
          kind: 0, // 异常日志
          type: 1, // 接口异常
          time: Date.now(), // 异常的发生时间
          message: `Not Found: ${getErrorFileName(item.name)}`, // 报错信息
          stack: `Not Found: ${item.name}`, // 异常堆栈
        }
        report(reportData)
      }
      xhr.addEventListener('loadend', onLoadend)
    }
  })

  // 白屏异常
  setTimeout(function () {
    const width = window.innerWidth
    const height = window.innerHeight
    let emptyPoints = 18 // 空白点数
    // 页面中轴上的18个点，检测是否有元素渲染
    for (let i = 1; i < 10; i++) {
      isWrapper(document.elementsFromPoint(width / 2, (height / 10) * i)[0])
      isWrapper(document.elementsFromPoint((width / 10) * i, height / 2)[0])
    }
    // 页面中轴上没有元素，触发白屏异常
    if (emptyPoints == 18) {
      const reportData = {
        kind: 0, // 异常日志
        type: 3, // 白屏异常
        time: Date.now(), // 发生异常的时间
        message: 'White screen', // 异常信息
        stack: 'No DOM rendering for three seconds', // 异常堆栈
      }
      report(reportData)
    }
    // 检测坐标元素是否不为HTML和BODY
    function isWrapper(dom) {
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
