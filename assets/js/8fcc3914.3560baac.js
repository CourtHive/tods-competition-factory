"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[6904],{7942:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>d});var r=n(959);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),g=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=g(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=g(n),m=o,d=c["".concat(s,".").concat(m)]||c[m]||p[m]||a;return n?r.createElement(d,i(i({ref:t},u),{},{components:n})):r.createElement(d,i({ref:t},u))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[c]="string"==typeof e?e:o,i[1]=l;for(var g=2;g<a;g++)i[g]=n[g];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},3133:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>g});var r=n(8957),o=(n(959),n(7942));const a={title:"Engine Logging"},i=void 0,l={unversionedId:"engines/engine-logging",id:"engines/engine-logging",title:"Engine Logging",description:"Competition Factory engines provide facilities for logging function performance, parameters, and results.",source:"@site/docs/engines/engine-logging.md",sourceDirName:"engines",slug:"/engines/engine-logging",permalink:"/tods-competition-factory/docs/engines/engine-logging",draft:!1,tags:[],version:"current",frontMatter:{title:"Engine Logging"},sidebar:"docs",previous:{title:"Engine Methods",permalink:"/tods-competition-factory/docs/engines/engine-methods"},next:{title:"Engine Middleware",permalink:"/tods-competition-factory/docs/engines/engine-middleware"}},s={},g=[{value:"Custom Logging",id:"custom-logging",level:2},{value:"Logging Configuration",id:"logging-configuration",level:2},{value:"Logged Details",id:"logged-details",level:2}],u={toc:g},c="wrapper";function p(e){let{components:t,...n}=e;return(0,o.kt)(c,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Competition Factory ",(0,o.kt)("strong",{parentName:"p"},"engines")," provide facilities for logging function performance, parameters, and results.\nLogging can be configured and enabled in ",(0,o.kt)("strong",{parentName:"p"},"globalState")," directly or by calling ",(0,o.kt)("inlineCode",{parentName:"p"},"engine.devContext(params)"),"."),(0,o.kt)("h2",{id:"custom-logging"},"Custom Logging"),(0,o.kt)("p",null,"By default factory engines will log to the console. It is possible to define a custom logging function:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { globalState: { setGlobalLog } } from 'tods-competition-factory'\n\nfunction customLoggingFunction({ log }) {\n  console.log('log:', log)\n}\n\nsetGlobalLog(customLoggingFunction)\n")),(0,o.kt)("h2",{id:"logging-configuration"},"Logging Configuration"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { globalState: { setDevContext } } from 'tods-competition-factory'\nsetDevContext({ perf: true, params: true, results: true, errors: true });\n\n// - or -\naskEngine.devContext({ perf: true, params: true, results: true, errors: true });\n\n")),(0,o.kt)("h2",{id:"logged-details"},"Logged Details"),(0,o.kt)("p",null,"The values passed into ",(0,o.kt)("inlineCode",{parentName:"p"},"devContext")," for the following attributes can be either boolean or an array of function names."),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"errors"),": log method errors (e.g. invalid parameters)"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"results"),": log results returned by function(s)"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"params"),": log values passed into function(s)")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.devContext({ errors: true }); // log all errors reported by all methods\naskEngine.devContext({ params: true }); // log param values for all functions\naskEngine.devContext({ results: true }); // log results for all functions\n\naskEngine.devContext({ params: ['getParticipants'], results: true }); // log paramaters and results only four the `getParticipants` function\n")),(0,o.kt)("p",null,"For ",(0,o.kt)("strong",{parentName:"p"},"perf")," the value can be either boolean or a milliseconds threshold."),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"perf"),": log function execution time")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.devContext({ perf: 200 }); // log function execution times greater than 200ms\n")))}p.isMDXComponent=!0}}]);