"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[8855],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>f});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},l=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,l=a(e,["components","mdxType","originalType","parentName"]),u=p(n),f=o,d=u["".concat(s,".").concat(f)]||u[f]||m[f]||i;return n?r.createElement(d,c(c({ref:t},l),{},{components:n})):r.createElement(d,c({ref:t},l))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,c=new Array(i);c[0]=u;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a.mdxType="string"==typeof e?e:o,c[1]=a;for(var p=2;p<i;p++)c[p]=n[p];return r.createElement.apply(null,c)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},1577:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>c,default:()=>m,frontMatter:()=>i,metadata:()=>a,toc:()=>p});var r=n(7462),o=(n(7294),n(3905));const i={name:"Mocks Engine Overview",title:"Overview"},c=void 0,a={unversionedId:"engines/mocks-engine-overview",id:"engines/mocks-engine-overview",title:"Overview",description:"mocksEngine generates complete tournament objects, or tournamentRecords, as well as mock persons, participants and matchUp outcomes.",source:"@site/docs/engines/mocks-engine-overview.mdx",sourceDirName:"engines",slug:"/engines/mocks-engine-overview",permalink:"/tods-competition-factory/docs/engines/mocks-engine-overview",draft:!1,tags:[],version:"current",frontMatter:{name:"Mocks Engine Overview",title:"Overview"},sidebar:"docs",previous:{title:"Subscriptions",permalink:"/tods-competition-factory/docs/concepts/subscriptions"},next:{title:"mocksEngine API",permalink:"/tods-competition-factory/docs/apis/mocks-engine-api"}},s={},p=[],l={toc:p};function m(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"mocksEngine")," generates complete tournament objects, or ",(0,o.kt)("inlineCode",{parentName:"p"},"tournamentRecords"),", as well as mock ",(0,o.kt)("inlineCode",{parentName:"p"},"persons"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"participants")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"matchUp")," outcomes."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { mocksEngine } from 'tods-competition-factory';\n// -- or --\nconst { mocksEngine } = require('tods-competition-factory');\n")))}m.isMDXComponent=!0}}]);