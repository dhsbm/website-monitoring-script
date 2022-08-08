// @ts-nocheck
import { report } from './util'

export default function () {
  let lcp
  new PerformanceObserver(function (entryList, observer) {
    let perfEntries = entryList.getEntries()
    lcp = perfEntries[0].startTime
    observer.disconnect()
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  setTimeout(function () {
    const { fetchStart, domContentLoadedEventEnd, loadEventEnd, domainLookupStart, domainLookupEnd } =
      window.performance.timing
    const dns = (domainLookupEnd - domainLookupStart) | 0
    const dcl = (domContentLoadedEventEnd - fetchStart) | 0
    const l = (loadEventEnd - fetchStart) | 0
    let fp = performance.getEntriesByName('first-paint')[0]
    fp = fp ? fp.startTime | 0 : dcl
    let fcp = performance.getEntriesByName('first-contentful-paint')[0]
    fcp = fcp ? fp.startTime | 0 : fp
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
    report(reportData)
    // console.log(reportData)
  }, 3000)
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
