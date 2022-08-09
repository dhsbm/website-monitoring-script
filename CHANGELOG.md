## 1.0.3 (2022-08-09)


### Bug Fixes

* 改善了异常类型的采集方式 ([b807a5a](https://gitee.com/du-hao-111/website-monitoring-script/commits/b807a5a5974106544a1f78cec0ab1e7b2e990892))
* 监听history的pushState和replaceState事件 ([67a1c95](https://gitee.com/du-hao-111/website-monitoring-script/commits/67a1c9547ee91defcbb34094dcfdf68598e79a8d))
* 解决了fetch请求无法读取数据的问题 ([b60f036](https://gitee.com/du-hao-111/website-monitoring-script/commits/b60f0365936e7c72da0f1b3b03202d4c326a4f36))
* 上报请求改用原生方法，绕过监控 ([7f3729a](https://gitee.com/du-hao-111/website-monitoring-script/commits/7f3729a6c16c6ea71ccadc7a29a734e7d8141e4a))
* 修复白屏异常传参错误的问题 ([51210a8](https://gitee.com/du-hao-111/website-monitoring-script/commits/51210a81d6cc30e83b149053bed5f753f5574749))
* 修复了项目使用mock时，由于XMLHttpRequest被改写导致的报错 ([3901c54](https://gitee.com/du-hao-111/website-monitoring-script/commits/3901c54070ca25c8581ae95a06ed4cb76e638821))
* 增加了对hash路径的采集 ([5f3b75d](https://gitee.com/du-hao-111/website-monitoring-script/commits/5f3b75d379808314e7e5c577ac275155ff28b983))


### Features

* 将请求改为服务器路径，公开了setOption方法 ([98a2a97](https://gitee.com/du-hao-111/website-monitoring-script/commits/98a2a97251faa9ee81aef00c3e9ad98f80a71447))
* 实现是否为新访客的判断功能 ([71995a0](https://gitee.com/du-hao-111/website-monitoring-script/commits/71995a020c62a51814c798b99dd173fc755a00d4))
* 添加性能和行为监控功能 ([7cc218e](https://gitee.com/du-hao-111/website-monitoring-script/commits/7cc218e000b3369d4e59aaa242cc302f104fe417))
* 完成异常和请求监控功能，并提供测试用例 ([e92dd56](https://gitee.com/du-hao-111/website-monitoring-script/commits/e92dd56d6d50ba54830a93d7a50a048ad7983f26))
* 修改了打包生成的文件名，更新测试用例 ([b894122](https://gitee.com/du-hao-111/website-monitoring-script/commits/b89412279ef8e542f1ea4ea05bcbb67b64c4afc1))
* 增加了对中文路径的解码处理 ([f528802](https://gitee.com/du-hao-111/website-monitoring-script/commits/f528802c9e0c63fc9ff9f6d8ddf82f4a7f9b26ce))
* 增加了style标签中的资源异常检测 ([9f960f0](https://gitee.com/du-hao-111/website-monitoring-script/commits/9f960f0ffea6e87ad5bc5b9df3bb52582ae92b34))



