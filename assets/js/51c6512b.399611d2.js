"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4100],{7942:(e,n,t)=>{t.d(n,{Zo:()=>p,kt:()=>y});var r=t(959);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var l=r.createContext({}),s=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},p=function(e){var n=s(e.components);return r.createElement(l.Provider,{value:n},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),u=s(t),f=i,y=u["".concat(l,".").concat(f)]||u[f]||d[f]||o;return t?r.createElement(y,a(a({ref:n},p),{},{components:t})):r.createElement(y,a({ref:n},p))}));function y(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,a=new Array(o);a[0]=f;var c={};for(var l in n)hasOwnProperty.call(n,l)&&(c[l]=n[l]);c.originalType=e,c[u]="string"==typeof e?e:i,a[1]=c;for(var s=2;s<o;s++)a[s]=t[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},3642:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>c,toc:()=>s});var r=t(8957),i=(t(959),t(7942));const o={title:"Ranking Policy"},a=void 0,c={unversionedId:"policies/rankingPolicy",id:"policies/rankingPolicy",title:"Ranking Policy",description:"Ranking Policies are used exclusively by the scaleEngine.",source:"@site/docs/policies/rankingPolicy.md",sourceDirName:"policies",slug:"/policies/rankingPolicy",permalink:"/tods-competition-factory/docs/policies/rankingPolicy",draft:!1,tags:[],version:"current",frontMatter:{title:"Ranking Policy"},sidebar:"docs",previous:{title:"Scheduling Policy",permalink:"/tods-competition-factory/docs/policies/scheduling"},next:{title:"Round Naming",permalink:"/tods-competition-factory/docs/policies/roundNaming"}},l={},s=[],p={toc:s},u="wrapper";function d(e){let{components:n,...t}=e;return(0,i.kt)(u,(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"Ranking Policies are used exclusively by the ",(0,i.kt)("a",{parentName:"p",href:"../engines/scale-engine-overview"},(0,i.kt)("strong",{parentName:"a"},"scaleEngine")),".")),(0,i.kt)("p",null,"A Ranking Policy determines how points are awarded to participants for their participation in events and consists of ",(0,i.kt)("inlineCode",{parentName:"p"},"awardProfiles")," which can be scoped based on a variety of attributes which are found on hydrated ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"cosnt rankingPoints = {\n  awardProfiles: [\n    {\n      eventTypes: [],\n      drawTypes: [],\n      flights: [],\n      stages: [],\n      stageSequences: [],\n    }\n  ]\n}\n")))}d.isMDXComponent=!0}}]);