"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7762],{3905:(t,e,r)=>{r.d(e,{Zo:()=>l,kt:()=>d});var n=r(7294);function o(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function i(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function s(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?i(Object(r),!0).forEach((function(e){o(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function a(t,e){if(null==t)return{};var r,n,o=function(t,e){if(null==t)return{};var r,n,o={},i=Object.keys(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||(o[r]=t[r]);return o}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(o[r]=t[r])}return o}var u=n.createContext({}),c=function(t){var e=n.useContext(u),r=e;return t&&(r="function"==typeof t?t(e):s(s({},e),t)),r},l=function(t){var e=c(t.components);return n.createElement(u.Provider,{value:e},t.children)},p={inlineCode:"code",wrapper:function(t){var e=t.children;return n.createElement(n.Fragment,{},e)}},f=n.forwardRef((function(t,e){var r=t.components,o=t.mdxType,i=t.originalType,u=t.parentName,l=a(t,["components","mdxType","originalType","parentName"]),f=c(r),d=o,m=f["".concat(u,".").concat(d)]||f[d]||p[d]||i;return r?n.createElement(m,s(s({ref:e},l),{},{components:r})):n.createElement(m,s({ref:e},l))}));function d(t,e){var r=arguments,o=e&&e.mdxType;if("string"==typeof t||o){var i=r.length,s=new Array(i);s[0]=f;var a={};for(var u in e)hasOwnProperty.call(e,u)&&(a[u]=e[u]);a.originalType=t,a.mdxType="string"==typeof t?t:o,s[1]=a;for(var c=2;c<i;c++)s[c]=r[c];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},3247:(t,e,r)=>{r.r(e),r.d(e,{assets:()=>u,contentTitle:()=>s,default:()=>p,frontMatter:()=>i,metadata:()=>a,toc:()=>c});var n=r(7462),o=(r(7294),r(3905));const i={title:"structureSort"},s=void 0,a={unversionedId:"utilities/structure-sort",id:"utilities/structure-sort",title:"structureSort",description:"Sorting function to arrange structures by stage, positionAssignments count (size) then stageSequence",source:"@site/docs/utilities/structure-sort.md",sourceDirName:"utilities",slug:"/utilities/structure-sort",permalink:"/CourtHive/tods-competition-factory/docs/utilities/structure-sort",draft:!1,tags:[],version:"current",frontMatter:{title:"structureSort"},sidebar:"docs",previous:{title:"makeDeepCopy",permalink:"/CourtHive/tods-competition-factory/docs/utilities/make-deep-copy"},next:{title:"JSON2CSV",permalink:"/CourtHive/tods-competition-factory/docs/utilities/json-to-csv"}},u={},c=[{value:"Optionally pass configuration object.",id:"optionally-pass-configuration-object",level:2}],l={toc:c};function p(t){let{components:e,...r}=t;return(0,o.kt)("wrapper",(0,n.Z)({},l,r,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Sorting function to arrange structures by stage, positionAssignments count (size) then stageSequence\nUsed internally to order Compass structures"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { utilities } from 'tods-competition-factory';\nconst sortedStructures = drawDefinition.structures.sort(\n  utilities.structureSort\n);\n")),(0,o.kt)("h2",{id:"optionally-pass-configuration-object"},"Optionally pass configuration object."),(0,o.kt)("p",null,"Mode 'finishing positions' sorts MAIN stage ",(0,o.kt)("inlineCode",{parentName:"p"},"structures")," by participant final positions first, followwed by PLAY_OFF, CONSOLATION, QUALIFYING and finally VOLUNTARY_CONSOLATION. NOTE: Compass directions are all considered MAIN stage."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { drawDefinitionConstants, utilities } from 'tods-competition-factory';\nconst { FINISHING_POSITIONS } = drawDefinitionConstants;\n\nconst sortedStructures = drawDefinition.structures.sort((a, b) =>\n  utilities.structureSort(a, b, { mode: FINISHING_POSITIONS })\n);\n")),(0,o.kt)("p",null,"Mode 'aggregate event structures' is for use when ",(0,o.kt)("inlineCode",{parentName:"p"},"structures")," from multiple ",(0,o.kt)("inlineCode",{parentName:"p"},"drawDefinitions"),", potentially across multiple ",(0,o.kt)("inlineCode",{parentName:"p"},"events"),", have been aggregated. Sorts MAIN stageSequence: 1 first, then PLAY_OFF structures, remaining MAIN stageSequences, followed by CONSOLATION, QUALIFYING and finally VOLUNTARY_CONSOLATION."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { drawDefinitionConstants, utilities } from 'tods-competition-factory';\nconst { AGGREGATE_EVENT_STRUCTURES } = drawDefinitionConstants;\n\nconst sortedStructures = drawDefinition.structures.sort((a, b) =>\n  utilities.structureSort(a, b, { mode: AGGREGATE_EVENT_STRUCTURES })\n);\n")),(0,o.kt)("hr",null))}p.isMDXComponent=!0}}]);