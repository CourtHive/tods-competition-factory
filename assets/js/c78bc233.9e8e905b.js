"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[830],{7942:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>y});var r=n(959);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},l=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},g=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),d=s(n),g=a,y=d["".concat(p,".").concat(g)]||d[g]||u[g]||o;return n?r.createElement(y,i(i({ref:t},l),{},{components:n})):r.createElement(y,i({ref:t},l))}));function y(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=g;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[d]="string"==typeof e?e:a,i[1]=c;for(var s=2;s<o;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}g.displayName="MDXCreateElement"},772:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>c,toc:()=>s});var r=n(8957),a=(n(959),n(7942));const o={title:"Age Category Codes"},i=void 0,c={unversionedId:"codes/age-category",id:"codes/age-category",title:"Age Category Codes",description:"Age category codes may appear on an attribute of a category, which can appear in event and drawDefinition elements within a tournament record.",source:"@site/docs/codes/age-category.mdx",sourceDirName:"codes",slug:"/codes/age-category",permalink:"/tods-competition-factory/docs/codes/age-category",draft:!1,tags:[],version:"current",frontMatter:{title:"Age Category Codes"},sidebar:"docs",previous:{title:"Type Definitions",permalink:"/tods-competition-factory/docs/types/typedefs"},next:{title:"matchUpFormat Codes",permalink:"/tods-competition-factory/docs/codes/matchup-format"}},p={},s=[],l={toc:s},d="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Age category codes may appear on an attribute of a ",(0,a.kt)("a",{parentName:"p",href:"../types/typedefs/#generic"},(0,a.kt)("inlineCode",{parentName:"a"},"category")),", which can appear in ",(0,a.kt)("inlineCode",{parentName:"p"},"event")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"drawDefinition")," elements within a tournament record."),(0,a.kt)("p",null,"See ",(0,a.kt)("a",{parentName:"p",href:"https://itftennis.atlassian.net/wiki/spaces/TODS/pages/1272840305/Standard+Codes"},"ITF Standard Codes")," for an explanation of the construction of age category codes."),(0,a.kt)("p",null,"A ",(0,a.kt)("inlineCode",{parentName:"p"},"consideredDate")," is required for calculating ",(0,a.kt)("inlineCode",{parentName:"p"},"ageMaxDate")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"ageMinDate"),", values which can be used to validate a ",(0,a.kt)("inlineCode",{parentName:"p"},"participant")," entry into an event."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"import { parseAgeCategoryCode } from 'tods-competition-factory';\n\nconst { ageMax, ageMin, ageMaxDate, ageMinDate } = parseAgeCategoryCode({\n  category: { ageCategoryCode },\n  consideredDate, // required - typically the startDate or endDate of a tournament\n});\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function AgeCategoryDemo(props) {\n  const result = utilities.parseAgeCategoryCode({\n    category: { ageCategoryCode: '18U' },\n    consideredDate: '2022-01-01',\n  });\n\n  return <RenderJSON data={result} root={'result'} />;\n}\n")))}u.isMDXComponent=!0}}]);