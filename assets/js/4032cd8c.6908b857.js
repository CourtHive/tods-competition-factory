"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[1382],{7942:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>s});var o=n(959);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,i=function(e,t){if(null==e)return{};var n,o,i={},r=Object.keys(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=o.createContext({}),c=function(e){var t=o.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=c(e.components);return o.createElement(d.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},f=o.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=c(n),f=i,s=m["".concat(d,".").concat(f)]||m[f]||u[f]||r;return n?o.createElement(s,a(a({ref:t},p),{},{components:n})):o.createElement(s,a({ref:t},p))}));function s(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,a=new Array(r);a[0]=f;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[m]="string"==typeof e?e:i,a[1]=l;for(var c=2;c<r;c++)a[c]=n[c];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}f.displayName="MDXCreateElement"},1116:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>a,default:()=>u,frontMatter:()=>r,metadata:()=>l,toc:()=>c});var o=n(8957),i=(n(959),n(7942));const r={title:"tieFormat Governor"},a=void 0,l={unversionedId:"governors/tie-format-governor",id:"governors/tie-format-governor",title:"tieFormat Governor",description:"addCollectionDefinition",source:"@site/docs/governors/tie-format-governor.md",sourceDirName:"governors",slug:"/governors/tie-format-governor",permalink:"/tods-competition-factory/docs/governors/tie-format-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"tieFormat Governor"}},d={},c=[{value:"addCollectionDefinition",id:"addcollectiondefinition",level:2},{value:"addCollectionGroup",id:"addcollectiongroup",level:2},{value:"compareTieFormats",id:"comparetieformats",level:2},{value:"modifyCollectionDefinition",id:"modifycollectiondefinition",level:2},{value:"modifyTieFormat",id:"modifytieformat",level:2},{value:"orderCollectionDefinitions",id:"ordercollectiondefinitions",level:2},{value:"removeCollectionDefinition",id:"removecollectiondefinition",level:2},{value:"removeCollectionGroup",id:"removecollectiongroup",level:2},{value:"validateCollectionDefinition",id:"validatecollectiondefinition",level:2}],p={toc:c},m="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,o.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"import { tieFormatGovernor } from 'tods-competition-factory';\n")),(0,i.kt)("h2",{id:"addcollectiondefinition"},"addCollectionDefinition"),(0,i.kt)("p",null,"Adds a ",(0,i.kt)("inlineCode",{parentName:"p"},"collectionDefinition")," to the specified target, either ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUp"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"structure"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"drawDefinition")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"event"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.addCollectionDefinition({\n  updateInProgressMatchUps, // defaults to true; in progress matchUps have matchUpStatus: IN_PROGRESS\n  collectionDefinition, // will be validated\n  tieFormatName, // if not provided, existing tieFormatName will be deleted\n  structureId, // optional - if provided only tieFormat on structure will be modified\n  matchUpId, // optional - if provided only tieFormat on matchUp will be modified\n  eventId, // optional - if provided only tieFormat on event will be modified\n  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified\n  uuids, // optional - array of UUIDs to use for newly created matchUps\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"addcollectiongroup"},"addCollectionGroup"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.addCollectionGroup({\n  collectionIds: result.modifiedCollectionIds,\n  tieFormatName: 'Swelled',\n  groupDefinition,\n  structureId, // optional - if provided only tieFormat on structure will be modified\n  matchUpId, // optional - if provided only tieFormat on matchUp will be modified\n  eventId, // optional - if provided only tieFormat on event will be modified\n  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"comparetieformats"},"compareTieFormats"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.compareTieFormats({\n  considerations, // optional { collectionName?: boolean; collectionOrder?: boolean };\n  ancestor: tieFormat1,\n  descendant: tieFormat2,\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"modifycollectiondefinition"},"modifyCollectionDefinition"),(0,i.kt)("p",null,"Modifies the ",(0,i.kt)("inlineCode",{parentName:"p"},"collectionName")," and/or ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUpFormat")," for targeted ",(0,i.kt)("inlineCode",{parentName:"p"},"collectionId")," within the ",(0,i.kt)("inlineCode",{parentName:"p"},"tieFormat")," specified by ",(0,i.kt)("inlineCode",{parentName:"p"},"eventId"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"drawId"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"structureId")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUpId"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.modifyCollectionDefinition({\n  collectionName, // optional\n  matchUpFormat, // optional\n  collectionId, // required\n  structureId, // required if modifying tieFormat for a structure\n  matchUpId, // required if modifying tieFormat for a matchUp\n  eventId, // required if modifying tieFormat for a event\n  drawId, // required if modifying tieFormat for a drawDefinition or a structure\n  gender, // optional\n\n  // value assignment, only one is allowed to have a value\n  collectionValueProfiles, // optional - [{ collectionPosition: 1, value: 2 }] - there must be a value provided for all matchUp positions\n  collectionValue, // optional - value awarded for winning more than half of the matchUps in the collection\n  matchUpValue, // optional - value awarded for each matchUp won\n  scoreValue, // optional - value awarded for each game or point won (points for tiebreak sets)\n  setValue, // optional - value awarded for each set won\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"modifytieformat"},"modifyTieFormat"),(0,i.kt)("p",null,"Both modifies the ",(0,i.kt)("inlineCode",{parentName:"p"},"tieFormat")," on the target ",(0,i.kt)("inlineCode",{parentName:"p"},"event"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"drawDefinition"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"structure")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUp")," and adds/deletes ",(0,i.kt)("inlineCode",{parentName:"p"},"tieMatchUps")," as necessary."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.modifyTieFormat({\n  considerations, // optional { collectionName?: boolean; collectionOrder?: boolean };\n  modifiedTieFormat, // will be compared to existing tieFormat that is targeted and differences calculated\n  tournamentId, // required\n  structureId, // required if modifying tieFormat for a structure\n  matchUpId, // required if modifying tieFormat for a matchUp\n  eventId, // required if modifying tieFormat for a event\n  drawId, // required if modifying tieFormat for a drawDefinition or a structure\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"ordercollectiondefinitions"},"orderCollectionDefinitions"),(0,i.kt)("p",null,"Modify the array order of ",(0,i.kt)("inlineCode",{parentName:"p"},"tieFormat.collectionDefinitions")," for an ",(0,i.kt)("inlineCode",{parentName:"p"},"event"),", a ",(0,i.kt)("inlineCode",{parentName:"p"},"drawDefinition"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"structure"),", or ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUp"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.orderCollectionDefinitions({\n  orderMap: { collectionId1: 1, collectionId2: 2 },\n  tournamentId, // required\n  structureId, // required if modifying tieFormat for a structure\n  matchUpId, // required if modifying tieFormat for a matchUp\n  eventId, // required if modifying tieFormat for a event\n  drawId, // required if modifying tieFormat for a drawDefinition or a structure\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"removecollectiondefinition"},"removeCollectionDefinition"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.removeCollectionDefinition({\n  updateInProgressMatchUps, // optional; defaults to true\n  tieFormatComparison, // optional; defaults to false; when true will not delete unique collections on unscored matchUps\n  tieFormatName, // any time a collectionDefinition is modified a new name must be provided\n  tournamentId, // required\n  collectionId, // required - id of collectionDefinition to be removed\n  structureId, // optional - if removing from tieFormat associated with a specific structure\n  matchUpId, // optional - if removing from tieFormat asscoiated with a specific matchUp\n  eventId, // optional - if removing from tieFormat asscoiated with an event\n  drawId, // required if structureId is specified or if tieFormat associated with drawDefinition is to be modified\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"removecollectiongroup"},"removeCollectionGroup"),(0,i.kt)("p",null,"Removes a ",(0,i.kt)("inlineCode",{parentName:"p"},"collectionGroup")," from the ",(0,i.kt)("inlineCode",{parentName:"p"},"tieFormat")," found for the ",(0,i.kt)("inlineCode",{parentName:"p"},"event"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"drawDefinition"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"structure")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUp"),"; recalculates"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.removeCollectionGroup({\n  updateInProgressMatchUps, // optional - defaults to true\n  tieFormatName: 'New tieFormat', // if no name is provided then there will be no name\n  collectionGroupNumber: 1,\n  tournamentId, // required\n  structureId, // optional\n  matchUpId, // optional\n  eventId, // optional\n  drawId, // optional; required if structureId is targeted\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"validatecollectiondefinition"},"validateCollectionDefinition"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const { valid } = engine.validateCollectionDefinition({\n  collectionDefinition, // required\n  checkCollectionIds, // optional boolean - check that collectionIds are present\n  referenceCategory, // optional - category for comparision if eventId is not provided\n  referenceGender, // optional - expected gender if eventId is not provided\n  checkCategory, // optional boolean - defaults to true\n  checkGender, // optional boolean - defaults to true\n  eventId, // required only for checking gender\n});\n")),(0,i.kt)("hr",null))}u.isMDXComponent=!0}}]);