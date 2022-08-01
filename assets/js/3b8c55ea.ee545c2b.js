"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3217],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=s(n),m=o,f=d["".concat(c,".").concat(m)]||d[m]||u[m]||a;return n?r.createElement(f,i(i({ref:t},p),{},{components:n})):r.createElement(f,i({ref:t},p))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var s=2;s<a;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9803:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var r=n(7462),o=(n(7294),n(3905));const a={title:"Installation"},i=void 0,l={unversionedId:"installation",id:"installation",title:"Installation",description:"Test",source:"@site/docs/installation.md",sourceDirName:".",slug:"/installation",permalink:"/tods-competition-factory/docs/installation",draft:!1,tags:[],version:"current",frontMatter:{title:"Installation"},sidebar:"docs",previous:{title:"Features",permalink:"/tods-competition-factory/docs/features"},next:{title:"Actions",permalink:"/tods-competition-factory/docs/concepts/actions"}},c={},s=[{value:"Test",id:"test",level:2}],p={toc:s};function u(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"yarn install tods-competition-factory\n")),(0,o.kt)("h2",{id:"test"},"Test"),(0,o.kt)("p",null,"The ",(0,o.kt)("strong",{parentName:"p"},"Competition Factory")," is built following a Test Driven Development process. There are 350+ test suites and more than 1200+ individual tests that run before every release, covering greater than 92% of the code base."),(0,o.kt)("p",null,"These tests are good references for how to use the APIs provided by the ",(0,o.kt)("inlineCode",{parentName:"p"},"drawEngine"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"tournamentEngine"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"competitionEngine"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"mocksEngine")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"scoreGovernor"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"yarn test\n")))}u.isMDXComponent=!0}}]);