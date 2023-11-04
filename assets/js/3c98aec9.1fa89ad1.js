"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7762],{4796:(t,e,r)=>{r.r(e),r.d(e,{assets:()=>a,contentTitle:()=>s,default:()=>d,frontMatter:()=>i,metadata:()=>c,toc:()=>u});var n=r(1527),o=r(7942);const i={title:"structureSort"},s=void 0,c={id:"utilities/structure-sort",title:"structureSort",description:"Sorting function to arrange structures by stage, positionAssignments count (size) then stageSequence",source:"@site/docs/utilities/structure-sort.md",sourceDirName:"utilities",slug:"/utilities/structure-sort",permalink:"/tods-competition-factory/docs/utilities/structure-sort",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{title:"structureSort"},sidebar:"docs",previous:{title:"makeDeepCopy",permalink:"/tods-competition-factory/docs/utilities/make-deep-copy"},next:{title:"JSON2CSV",permalink:"/tods-competition-factory/docs/utilities/json-to-csv"}},a={},u=[{value:"Optionally pass configuration object.",id:"optionally-pass-configuration-object",level:2}];function l(t){const e={code:"code",h2:"h2",hr:"hr",p:"p",pre:"pre",...(0,o.ah)(),...t.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(e.p,{children:"Sorting function to arrange structures by stage, positionAssignments count (size) then stageSequence\nUsed internally to order Compass structures"}),"\n",(0,n.jsx)(e.pre,{children:(0,n.jsx)(e.code,{className:"language-js",children:"import { utilities } from 'tods-competition-factory';\nconst sortedStructures = drawDefinition.structures.sort(\n  utilities.structureSort\n);\n"})}),"\n",(0,n.jsx)(e.h2,{id:"optionally-pass-configuration-object",children:"Optionally pass configuration object."}),"\n",(0,n.jsxs)(e.p,{children:["Mode 'finishing positions' sorts MAIN stage ",(0,n.jsx)(e.code,{children:"structures"})," by participant final positions first, followwed by PLAY_OFF, CONSOLATION, QUALIFYING and finally VOLUNTARY_CONSOLATION. NOTE: Compass directions are all considered MAIN stage."]}),"\n",(0,n.jsx)(e.pre,{children:(0,n.jsx)(e.code,{className:"language-js",children:"import { drawDefinitionConstants, utilities } from 'tods-competition-factory';\nconst { FINISHING_POSITIONS } = drawDefinitionConstants;\n\nconst sortedStructures = drawDefinition.structures.sort((a, b) =>\n  utilities.structureSort(a, b, { mode: FINISHING_POSITIONS })\n);\n"})}),"\n",(0,n.jsxs)(e.p,{children:["Mode 'aggregate event structures' is for use when ",(0,n.jsx)(e.code,{children:"structures"})," from multiple ",(0,n.jsx)(e.code,{children:"drawDefinitions"}),", potentially across multiple ",(0,n.jsx)(e.code,{children:"events"}),", have been aggregated. Sorts MAIN stageSequence: 1 first, then PLAY_OFF structures, remaining MAIN stageSequences, followed by CONSOLATION, QUALIFYING and finally VOLUNTARY_CONSOLATION."]}),"\n",(0,n.jsx)(e.pre,{children:(0,n.jsx)(e.code,{className:"language-js",children:"import { drawDefinitionConstants, utilities } from 'tods-competition-factory';\nconst { AGGREGATE_EVENT_STRUCTURES } = drawDefinitionConstants;\n\nconst sortedStructures = drawDefinition.structures.sort((a, b) =>\n  utilities.structureSort(a, b, { mode: AGGREGATE_EVENT_STRUCTURES })\n);\n"})}),"\n",(0,n.jsx)(e.hr,{})]})}function d(t={}){const{wrapper:e}={...(0,o.ah)(),...t.components};return e?(0,n.jsx)(e,{...t,children:(0,n.jsx)(l,{...t})}):l(t)}},7942:(t,e,r)=>{r.d(e,{ah:()=>u});var n=r(959);function o(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function i(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function s(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?i(Object(r),!0).forEach((function(e){o(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function c(t,e){if(null==t)return{};var r,n,o=function(t,e){if(null==t)return{};var r,n,o={},i=Object.keys(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||(o[r]=t[r]);return o}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(o[r]=t[r])}return o}var a=n.createContext({}),u=function(t){var e=n.useContext(a),r=e;return t&&(r="function"==typeof t?t(e):s(s({},e),t)),r},l={inlineCode:"code",wrapper:function(t){var e=t.children;return n.createElement(n.Fragment,{},e)}},d=n.forwardRef((function(t,e){var r=t.components,o=t.mdxType,i=t.originalType,a=t.parentName,d=c(t,["components","mdxType","originalType","parentName"]),p=u(r),f=o,m=p["".concat(a,".").concat(f)]||p[f]||l[f]||i;return r?n.createElement(m,s(s({ref:e},d),{},{components:r})):n.createElement(m,s({ref:e},d))}));d.displayName="MDXCreateElement"}}]);