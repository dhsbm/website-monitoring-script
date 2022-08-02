# 用法

在项目的主入口文件中导入 sdk

`import Tracker from 'xymonitor'`

创建实例

`const tracker = new Tracker(options)`

options 是一个对象，接受以下字段：

- requestUrl<string>: 一个接受上报信息的后端接口地址，如果不传默认为'http://localhost:3000/report/error',
- historyTracker<boolean>:开关，控制是否监控页面在 history 模式下的路由跳转
- hashTracker<boolean>:开关，控制是否监控页面在 hash 模式下的路由跳转
- jsErrorTracker<boolean>:开关，控制是否监控页面中发生的 JS 运行时错误，包括 promise 未指定失败回调
- resourceLoadTracker<boolean>:开关，控制是否监控页面中资源加载
- requestTracker<boolean>:开关，控制是否监控页面中的请求，包括 AJAX 请求和 fetch 请求
- performanceTracker<boolean>:开关，控制是否监控页面的加载性能

实例对象 tracker 可调用的方法：

- tracker.setExtra(obj)
  该方法接受一个对象作为参数，用于在每一条上报信息中添加额外的信息
- tracker.setUUID(str)
  该方法接受一个 string 类型的值作为参数，用于在每一条上报信息中添加一个 uuid 字段，如果不传默认 uuid 字段值为空字符串
- tracker.sendTracker(obj)
  该方法接受一个对象作为参数，调用该方法会往后端发送一条上报信息，其中 subType 字段的值为 self-report，参数 obj 中请勿包含 subType 属性，其余属性会作为顶层属性与默认的上报字段组合成一条上报信息发送

后端可接收到的所有上报信息都会包含以下字段：

- sdkVersion: this.config.sdkVersion, //sdk 版本
- uuid: this.config.uuid || '', //用户 uuid，用于分析 UV
- reportTime: Date.now(), //信息上报的时间
- extra: this.config.extra || '', // 用户自定义上报的信息
- url: location.href //上报信息源 url

不同类型的上报信息会有不同的额外字段：

类型：behavior-historyPV

- subType: 'behavior-historyPV'
- event:'pushState'/'replaceState'/'popstate'

* 注：event 字段是用来标识触发了哪个事件引发的信息上报

类型：behavior-hashPV

- subType: 'behavior-hashPV'
- event: 'hashchange'

类型：error-jsError

- subType: 'error-jsError'
- event:"error"
- message: "一条错误信息"
- line: "13" 一个字符串类型的数字，标识错误所在的行号
- col: "14" 一个字符串类型的数字，标识错误所在的列号
- stack: 一个数组，包含错误所处的堆栈信息

类型：error-promiseReject

- subType: 'error-promiseReject'
- event: 'unhandledrejection'
- reason: Promise 失败的 reason
- message: 'No callback function was specified for the failed Promise'

类型：performance-resourceLoad

- subType: 'performance-resourceLoad'
- event: "resource"
- resourceType: "img"/"script"/"link" 资源的类型
- duration: 1234, 资源加载的耗时
- status: "Success"/"Failed" 资源加载成功与否
- src_href: 资源请求的 src 或者 href

类型：performance-XMLHttpRequest

- subType: 'performance-XMLHttpRequest'
- event: "XMLHttpRequest"
- startTime: 时间戳，发起请求的时间
- endTime: 时间戳，请求的回调 onload 触发的时间
- duration: 1234 AJAX 请求耗时
- req_url: 请求的 url
- method: 请求方法（小写）
- status: 'Success'/'Failed' 请求成功与否

类型：performance-fetch

- subType: 'performance-fetch'
- event: "fetch"
- startTime: 时间戳，发起请求的时间
- endTime: 时间戳，请求的回调 onload 触发的时间
- duration: 1234 AJAX 请求耗时
- req_href: 请求的 url
- method: 请求方法（小写）
- status: 'Success'/'Failed' 请求成功与否

类型：performance-LCP

- subType: 'performance-LCP'
- event: "LCP"
- LCP: 从页面加载开始到最大文本块或图像元素在屏幕上完成渲染的时间

类型：performance-FCP

- subType: 'performance-FCP'
- event: "FCP"
- FCP: 从页面加载开始到页面内容的任何部分在屏幕上完成渲染的时间

类型：performance-FP

- subType: 'performance-FP'
- event: "FP"
- FP: 从页面加载开始到第一个像素绘制到屏幕上的时间
