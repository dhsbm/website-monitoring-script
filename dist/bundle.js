(()=>{"use strict";function t(t){const e=new XMLHttpRequest;e.open("POST","/database",!0),e.send(t)}function e(t){return t.split(":")[0]+": "}function n(t){return t.split("\n").slice(1).map((t=>t.trim())).join(" ^ ")}function o(t){return t<400}window.addEventListener("error",(o=>{let s;if(o.target&&o.target.src){const t=function(t){const e=t.split("/");return e[e.length-1]}(o.target.src);s={web_id:-1,kind:0,url:location.hostname+location.pathname,type:1,time:Date.now(),message:`Not Found: ${t}`,stack:`Not Found: ${o.target.src}`}}else console.log(o),s={web_id:-1,kind:0,url:location.hostname+location.pathname,type:0,time:Date.now(),message:e(o.error.stack)+o.error.message,stack:n(o.error.stack)};t(s),console.log(s)}),!0),window.addEventListener("unhandledrejection",(o=>{const s={web_id:-1,kind:0,url:location.hostname+location.pathname,type:0,time:Date.now(),message:e(o.reason.stack)+o.reason.message,stack:n(o.reason.stack)};console.log(s),t(s)}),!0),setTimeout((()=>{const e=window.innerWidth,n=window.innerHeight;let o=18;for(let t=1;t<10;t++)s(document.elementsFromPoint(e/2,n/10*t)[0]),s(document.elementsFromPoint(e/10*t,n/2)[0]);if(18==o){const e={web_id:-1,kind:0,url:location.hostname+location.pathname,type:0,time:Date.now(),message:"White screen",stack:"No DOM rendering for three seconds"};console.log(e),t(e)}function s(t){const e=t.tagName;"HTML"!=e&&"BODY"!=e&&o--}}),3e3),function(){const e=XMLHttpRequest.prototype.open,n=XMLHttpRequest.prototype.send,s=XMLHttpRequest.prototype;let a,i;s.open=function(...t){var n;return a=t[0].toUpperCase(),n=t[1],i=-1!=n.indexOf("http")?n:"/"==n[0]?location.origin+n:location.origin+"/"+n,e.apply(this,t)},s.send=function(...e){const s=Date.now(),r=i,c=a,l=()=>{const e=Date.now(),n=o(this.status),a={web_id:-1,kind:3,url:location.hostname+location.pathname,time:s,send_url:r,way:c,success:n,status:this.status,res_time:e-s,res_body:this.response?JSON.stringify(this.response):this.statusText};if(-1==r.indexOf("database")&&(console.log(a),t(a)),this.removeEventListener("loadend",l,!0),!n){const n={web_id:-1,kind:0,url:location.hostname+location.pathname,type:2,time:e,message:`${this.status} ${this.statusText}`,stack:`Failed when requesting ${r}`};console.log(n),t(n)}};return this.addEventListener("loadend",l,!0),n.apply(this,e)}}(),window.fetch&&function(){const e=window.fetch;window.fetch=function(n,s){const a=Date.now();return e(n,s).then((e=>{const n=Date.now();return e.text().then((i=>{const r=o(e.status),c={web_id:-1,kind:3,url:location.hostname+location.pathname,time:a,send_url:e.url,way:(s?.method||"GET").toUpperCase(),success:r,status:e.status,res_time:n-a,res_body:i};if(console.log(c),t(c),!r){const o={web_id:-1,kind:0,url:location.hostname+location.pathname,type:2,time:n,message:`${e.status} ${e.statusText}`,stack:`Failed when requesting ${e.url}`};console.log(o),t(o)}})),e}))}}()})();