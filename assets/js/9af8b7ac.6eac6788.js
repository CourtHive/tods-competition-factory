"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[8265],{1422:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>a,contentTitle:()=>i,default:()=>d,frontMatter:()=>c,metadata:()=>l,toc:()=>s});var r=n(1527),o=n(7942);const c={title:"Feed Policy"},i=void 0,l={id:"policies/feedPolicy",title:"Feed Policy",description:"",source:"@site/docs/policies/feedPolicy.md",sourceDirName:"policies",slug:"/policies/feedPolicy",permalink:"/tods-competition-factory/docs/policies/feedPolicy",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{title:"Feed Policy"},sidebar:"docs",previous:{title:"Round Robin Tally Policy",permalink:"/tods-competition-factory/docs/policies/tallyPolicy"},next:{title:"Scheduling",permalink:"/tods-competition-factory/docs/concepts/scheduling"}},a={},s=[];function O(e){const t={code:"code",pre:"pre",...(0,o.ah)(),...e.components};return(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-js",children:"const feedPolicy = {\n  feedMainFinal, // optional - defaults to false; drawSize: 4 will not feed main final unless true\n  roundGroupedOrder: [\n    [1], // complete round TOP_DOWN\n    [1], // complete round BOTTOM_UP\n    [1, 2], // 1st half BOTTOM_UP, 2nd half BOTTOM_UP\n    [2, 1, 4, 3], // 2nd Qtr BOTTOM_UP, 1st Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP\n    [2, 1, 4, 3, 6, 5, 8, 7], // 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP\n    [1], // complete round BOTTOM_UP\n  ],\n  roundFeedProfiles: [\n    TOP_DOWN,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n    BOTTOM_UP,\n  ],\n};\n"})})}function d(e={}){const{wrapper:t}={...(0,o.ah)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(O,{...e})}):O(e)}},7942:(e,t,n)=>{n.d(t,{ah:()=>s});var r=n(959);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},c=Object.keys(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var a=r.createContext({}),s=function(e){var t=r.useContext(a),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},O={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,c=e.originalType,a=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=s(n),u=o,f=p["".concat(a,".").concat(u)]||p[u]||O[u]||c;return n?r.createElement(f,i(i({ref:t},d),{},{components:n})):r.createElement(f,i({ref:t},d))}));d.displayName="MDXCreateElement"}}]);