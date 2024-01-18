"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4100],{7942:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>y});var r=n(959);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},l=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},u="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),u=p(n),d=o,y=u["".concat(s,".").concat(d)]||u[d]||f[d]||i;return n?r.createElement(y,a(a({ref:t},l),{},{components:n})):r.createElement(y,a({ref:t},l))}));function y(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c[u]="string"==typeof e?e:o,a[1]=c;for(var p=2;p<i;p++)a[p]=n[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},3642:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>f,frontMatter:()=>i,metadata:()=>c,toc:()=>p});var r=n(8957),o=(n(959),n(7942));const i={title:"Ranking Policy"},a=void 0,c={unversionedId:"policies/rankingPolicy",id:"policies/rankingPolicy",title:"Ranking Policy",description:"A Ranking Policy determines how points are awarded to participants for their participation in events and consists of awardProfiles which can be scoped based on a variety of attributes which are found on hydrated matchUps.",source:"@site/docs/policies/rankingPolicy.md",sourceDirName:"policies",slug:"/policies/rankingPolicy",permalink:"/tods-competition-factory/docs/policies/rankingPolicy",draft:!1,tags:[],version:"current",frontMatter:{title:"Ranking Policy"}},s={},p=[],l={toc:p},u="wrapper";function f(e){let{components:t,...n}=e;return(0,o.kt)(u,(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"A Ranking Policy determines how points are awarded to participants for their participation in events and consists of ",(0,o.kt)("inlineCode",{parentName:"p"},"awardProfiles")," which can be scoped based on a variety of attributes which are found on hydrated ",(0,o.kt)("inlineCode",{parentName:"p"},"matchUps"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"cosnt rankingPoints = {\n  awardProfiles: [\n    {\n      eventTypes: [],\n      drawTypes: [],\n      flights: [],\n      stages: [],\n      stageSequences: [],\n    }\n  ]\n}\n")))}f.isMDXComponent=!0}}]);