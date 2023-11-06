"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[8265],{7942:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var r=n(959);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var a=r.createContext({}),p=function(e){var t=r.useContext(a),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(a.Provider,{value:t},e.children)},u="mdxType",O={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,a=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=p(n),d=o,f=u["".concat(a,".").concat(d)]||u[d]||O[d]||i;return n?r.createElement(f,c(c({ref:t},s),{},{components:n})):r.createElement(f,c({ref:t},s))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,c=new Array(i);c[0]=d;var l={};for(var a in t)hasOwnProperty.call(t,a)&&(l[a]=t[a]);l.originalType=e,l[u]="string"==typeof e?e:o,c[1]=l;for(var p=2;p<i;p++)c[p]=n[p];return r.createElement.apply(null,c)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},6782:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>a,contentTitle:()=>c,default:()=>O,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var r=n(8957),o=(n(959),n(7942));const i={title:"Feed Policy"},c=void 0,l={unversionedId:"policies/feedPolicy",id:"policies/feedPolicy",title:"Feed Policy",description:"",source:"@site/docs/policies/feedPolicy.md",sourceDirName:"policies",slug:"/policies/feedPolicy",permalink:"/tods-competition-factory/docs/policies/feedPolicy",draft:!1,tags:[],version:"current",frontMatter:{title:"Feed Policy"},sidebar:"docs",previous:{title:"Round Robin Tally Policy",permalink:"/tods-competition-factory/docs/policies/tallyPolicy"},next:{title:"Scheduling",permalink:"/tods-competition-factory/docs/concepts/scheduling"}},a={},p=[],s={toc:p},u="wrapper";function O(e){let{components:t,...n}=e;return(0,o.kt)(u,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"const feedPolicy = {\n  feedMainFinal, // optional - defaults to false; drawSize: 4 will not feed main final unless true\n  roundGroupedOrder: [\n    [1], // complete round TOP_DOWN\n    [1], // complete round BOTTOM_UP\n    [1, 2], // 1st half BOTTOM_UP, 2nd half BOTTOM_UP\n    [2, 1, 4, 3], // 2nd Qtr BOTTOM_UP, 1st Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP\n    [2, 1, 4, 3, 6, 5, 8, 7], // 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP\n    [1], // complete round BOTTOM_UP\n  ],\n  roundFeedProfiles: [\n    TOP_DOWN,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n  ],\n};\n")))}O.isMDXComponent=!0}}]);