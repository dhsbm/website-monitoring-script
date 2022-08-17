// @ts-nocheck
import { report } from './util'

export default function () {
  let lcp // 最大元素渲染时间
  let observer = new PerformanceObserver(function (entryList) {
    // 每次最大元素被替换，更新时间
    let perfEntries = entryList.getEntries()
    lcp = perfEntries[0].startTime | 0
  })
  observer.observe({ entryTypes: ['largest-contentful-paint'] }) // 监听最大元素更新
  // 绑定在load事件上，然后使用定时器执行
  window.addEventListener('load', function () {
    setTimeout(function () {
      const {
        domainLookupStart, // dns 解析开始
        domainLookupEnd, // dns 解析结束
        fetchStart, // 页面请求发送
        domContentLoadedEventEnd, // dom完全加载
        loadEventEnd, // 页面完全加载
      } = performance.timing
      const dns = (domainLookupEnd - domainLookupStart) | 0 // dns解析
      const dcl = (domContentLoadedEventEnd - fetchStart) | 0 // dom ready
      const l = (loadEventEnd - fetchStart) | 0 // onload
      let fp = performance.getEntriesByName('first-paint')[0] // 首屏渲染时间
      fp = fp ? fp.startTime | 0 : dcl
      let fcp = performance.getEntriesByName('first-contentful-paint')[0] // 首次内容渲染时间
      fcp = fcp ? fcp.startTime | 0 : fp
      const reportData = {
        kind: 1,
        time: Date.now(),
        dns: dns | 0,
        fp: fp,
        fcp: fcp,
        lcp: lcp || fcp || dcl,
        dcl: dcl,
        l: l,
      }
      report(reportData) // 上报日志
      observer.disconnect() // 停止监听最大元素的渲染
    }, 1000)
  })
}

// 暂未采集的指标
// let fmp // 最有意义的元素渲染
// new PerformanceObserver((entryList, observer) => {
//   let perfEntries = entryList.getEntries()
//   fmp = perfEntries[0]
//   observer.disconnect()
// }).observe({ entryTypes: ['element'] })
// let fid // 首次交互延迟
// new PerformanceObserver((entryList, observer) => {
//   let perfEntries = entryList.getEntries()
//   let first = perfEntries[0]
//   if (first) {
//     fid = first.processingStart - first.startTime
//   }
//   observer.disconnect()
// }).observe({ type: 'first-input', buffered: true })
