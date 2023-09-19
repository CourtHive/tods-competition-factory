"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3324],{7942:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>g});var r=n(959);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},l="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),l=p(n),d=a,g=l["".concat(c,".").concat(d)]||l[d]||u[d]||o;return n?r.createElement(g,i(i({ref:t},m),{},{components:n})):r.createElement(g,i({ref:t},m))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s[l]="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9835:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>s,toc:()=>p});var r=n(8957),a=(n(959),n(7942));const o={title:"State Engines"},i=void 0,s={unversionedId:"state-engines",id:"state-engines",title:"State Engines",description:"Competition Factory engines manage different concerns within a tournament and may be used either synchronously or asynchronously.",source:"@site/docs/state-engines.mdx",sourceDirName:".",slug:"/state-engines",permalink:"/tods-competition-factory/docs/state-engines",draft:!1,tags:[],version:"current",frontMatter:{title:"State Engines"},sidebar:"docs",previous:{title:"Introduction",permalink:"/tods-competition-factory/docs/"},next:{title:"Features",permalink:"/tods-competition-factory/docs/features"}},c={},p=[],m={toc:p},l="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(l,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Competition Factory engines manage different concerns within a tournament and may be used either synchronously or asynchronously.\nEngine methods which mutate/transform operate on documents which are held in state.\nThe ",(0,a.kt)("strong",{parentName:"p"},"competitionEngine"),", ",(0,a.kt)("strong",{parentName:"p"},"tournamentEngine")," and ",(0,a.kt)("strong",{parentName:"p"},"scaleEngine")," share a state which contains one or more ",(0,a.kt)("em",{parentName:"p"},"tournamentRecords"),";\nwhile the ",(0,a.kt)("strong",{parentName:"p"},"drawEngine")," and ",(0,a.kt)("strong",{parentName:"p"},"matchUpEngine")," have their own state."),(0,a.kt)("p",null,"By default a deep copy of documents are made as they are loaded into each state engine. This behavior can be overridden such that the engines operate on original documents."),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"./engines/competition-engine-overview"},(0,a.kt)("strong",{parentName:"a"},"competitionEngine"))," - manages resources which may be shared across multiple linked tournaments, such as venues (courts & other locations); includes advanced scheduling and cross-tournament reporting."),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"./engines/tournament-engine-overview"},(0,a.kt)("strong",{parentName:"a"},"tournamentEngine")),' - manages tournament metadata, participants, events (including the generation of complex draw types and "flights" within events), and reporting.'),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"./engines/draw-engine-overview"},(0,a.kt)("strong",{parentName:"a"},"drawEngine"))," - generates drawDefinitions and matchUp results; manages participant seeding and movement within and between draw structures."),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"./engines/matchUp-engine-overview"},(0,a.kt)("strong",{parentName:"a"},"matchUpEngine"))," - methods to manipulate tieFormats, analyze arrays of matchUps, and report on matchUp scores."),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"./engines/scale-engine-overview"},(0,a.kt)("strong",{parentName:"a"},"scaleEngine"))," - methods to generate ranking points and calculate ratings."))}u.isMDXComponent=!0}}]);