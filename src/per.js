import { report } from './util'

export default function () {
  let lcp
  new PerformanceObserver((entryList, observer) => {
    let perfEntries = entryList.getEntries()
    lcp = perfEntries[0]
    observer.disconnect()
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  setTimeout(() => {
    const { fetchStart, domContentLoadedEventEnd, loadEventEnd, domainLookupStart, domainLookupEnd } =
      window.performance.timing
    const dns = domainLookupEnd - domainLookupStart
    const dcl = domContentLoadedEventEnd - fetchStart
    const l = loadEventEnd - fetchStart
    let fp = performance.getEntriesByName('first-paint')[0]
    let fcp = performance.getEntriesByName('first-contentful-paint')[0]
    const reportData = {
      kind: 1,
      time: Date.now(),
      dns,
      fp: fp.startTime,
      fcp: fcp.startTime,
      lcp: lcp?.startTime || fcp.startTime,
      dcl,
      l,
    }
    report(reportData)
    console.log(reportData)
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
