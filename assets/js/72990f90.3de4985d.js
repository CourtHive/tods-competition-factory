"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2707],{7942:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>g});var r=n(959);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},l=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,p=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),m=s(n),d=o,g=m["".concat(p,".").concat(d)]||m[d]||u[d]||i;return n?r.createElement(g,a(a({ref:t},l),{},{components:n})):r.createElement(g,a({ref:t},l))}));function g(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=d;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[m]="string"==typeof e?e:o,a[1]=c;for(var s=2;s<i;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},190:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>a,default:()=>u,frontMatter:()=>i,metadata:()=>c,toc:()=>s});var r=n(8957),o=(n(959),n(7942));const i={title:"MatchUp Engine"},a=void 0,c={unversionedId:"engines/matchup-engine-overview",id:"engines/matchup-engine-overview",title:"MatchUp Engine",description:"matchUpEngine provides methods for querying against and reporting on matchUps along with utilities for parsing/validating matchUpFormat codes,",source:"@site/docs/engines/matchup-engine-overview.mdx",sourceDirName:"engines",slug:"/engines/matchup-engine-overview",permalink:"/tods-competition-factory/docs/engines/matchup-engine-overview",draft:!1,tags:[],version:"current",frontMatter:{title:"MatchUp Engine"},sidebar:"docs",previous:{title:"drawEngine API",permalink:"/tods-competition-factory/docs/apis/draw-engine-api"},next:{title:"matchUpEngine API",permalink:"/tods-competition-factory/docs/apis/matchup-engine-api"}},p={},s=[],l={toc:s},m="wrapper";function u(e){let{components:t,...n}=e;return(0,o.kt)(m,(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"matchUpEngine")," provides methods for querying against and reporting on ",(0,o.kt)("inlineCode",{parentName:"p"},"matchUps")," along with utilities for parsing/validating ",(0,o.kt)("inlineCode",{parentName:"p"},"matchUpFormat")," codes,\nand manipulating ",(0,o.kt)("inlineCode",{parentName:"p"},"tieFormat")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"score")," objects."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { matchUpEngine } from 'tods-competition-factory';\n")))}u.isMDXComponent=!0}}]);