"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[6636],{3805:(e,n,t)=>{t.d(n,{xA:()=>s,yg:()=>y});var a=t(758);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function r(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var p=a.createContext({}),c=function(e){var n=a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):r(r({},n),e)),t},s=function(e){var n=c(e.components);return a.createElement(p.Provider,{value:n},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},g=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),m=c(t),g=i,y=m["".concat(p,".").concat(g)]||m[g]||d[g]||o;return t?a.createElement(y,r(r({ref:n},s),{},{components:t})):a.createElement(y,r({ref:n},s))}));function y(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,r=new Array(o);r[0]=g;var l={};for(var p in n)hasOwnProperty.call(n,p)&&(l[p]=n[p]);l.originalType=e,l[m]="string"==typeof e?e:i,r[1]=l;for(var c=2;c<o;c++)r[c]=t[c];return a.createElement.apply(null,r)}return a.createElement.apply(null,t)}g.displayName="MDXCreateElement"},6347:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>r,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>c});var a=t(2232),i=(t(758),t(3805));const o={title:"tieFormats"},r=void 0,l={unversionedId:"concepts/tieFormat",id:"concepts/tieFormat",title:"tieFormats",description:"Overview",source:"@site/docs/concepts/tieFormat.mdx",sourceDirName:"concepts",slug:"/concepts/tieFormat",permalink:"/tods-competition-factory/docs/concepts/tieFormat",draft:!1,tags:[],version:"current",frontMatter:{title:"tieFormats"},sidebar:"docs",previous:{title:"lineUps",permalink:"/tods-competition-factory/docs/concepts/lineUp"},next:{title:"Draw Generation",permalink:"/tods-competition-factory/docs/concepts/draws-overview"}},p={},c=[{value:"Overview",id:"overview",level:2},{value:"Value Considerations",id:"value-considerations",level:2},{value:"tieFormat Use",id:"tieformat-use",level:2},{value:"Generating Draws",id:"generating-draws",level:3},{value:"Mapping lineUps",id:"mapping-lineups",level:3},{value:"tieFormat Example",id:"tieformat-example",level:2},{value:"tieFormat and lineUp propagation",id:"tieformat-and-lineup-propagation",level:2}],s={toc:c},m="wrapper";function d(e){let{components:n,...t}=e;return(0,i.yg)(m,(0,a.A)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,i.yg)("h2",{id:"overview"},"Overview"),(0,i.yg)("p",null,"A ",(0,i.yg)("inlineCode",{parentName:"p"},"tieFormat")," both describes collections of singles and doubles ",(0,i.yg)("inlineCode",{parentName:"p"},"tieMatchUps")," which are part of a ",(0,i.yg)("inlineCode",{parentName:"p"},"{ matchUpType: TEAM }")," ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp"),", and defines the target value which must be achieved in order to win the ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp"),"."),(0,i.yg)("p",null,"There can be any number of ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionDefinitions")," in a ",(0,i.yg)("inlineCode",{parentName:"p"},"tieMatchUp"),'.\nFor instance, there can be "Men\'s Singles", "Men\'s Doubles", "Womens\'s Singles", "Women\'s Doubles", and "Mixed Doubles".'),(0,i.yg)("p",null,"Each ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionDefinition")," defines how many ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUps")," are in the collection, the ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUpType")," (SINGLES or DOUBLES), the ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUpFormat")," to be used for scoring, and how value is assigned to each ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp"),".\n",(0,i.yg)("inlineCode",{parentName:"p"},"collectionDefinitions")," can optionally define ",(0,i.yg)("inlineCode",{parentName:"p"},"category")," and ",(0,i.yg)("inlineCode",{parentName:"p"},"gender"),"."),(0,i.yg)("h2",{id:"value-considerations"},"Value Considerations"),(0,i.yg)("p",null,"The score of a TEAM ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp")," is the summation of the value assigned for the wins on each side. Value can be assigned in numerous ways.\nWhen there is no ",(0,i.yg)("inlineCode",{parentName:"p"},"winCriteria")," specified, the ",(0,i.yg)("inlineCode",{parentName:"p"},"valueGoal")," defaults to one more than half of the potential value within scope (which can be the ",(0,i.yg)("inlineCode",{parentName:"p"},"tieFormat"),", a ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionDefinition"),", or a ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionGroup"),")."),(0,i.yg)("ul",null,(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"matchUpValue")," - specified value is awarded for each ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUp")," win"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"setValue")," - specified value is awarded for each set win"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"collectionValue")," - specified value is awarded for winning a collection"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"collecitonValueProfile")," - unique values are specified for each ",(0,i.yg)("inlineCode",{parentName:"li"},"collectionPosition")," within a collection"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"groupValue")," - specified value is awarded for reaching a ",(0,i.yg)("inlineCode",{parentName:"li"},"valueGoal")," by accumulating value across collections in the group"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"scoreValue")," - specified value is awarded for each sideScore (typically 1, typically used with ",(0,i.yg)("inlineCode",{parentName:"li"},"aggregateValue")," formats)")),(0,i.yg)("p",null,"See ",(0,i.yg)("a",{parentName:"p",href:"../types/typedefs#tieformat"},"tieFormat type definitions")),(0,i.yg)("h2",{id:"tieformat-use"},"tieFormat Use"),(0,i.yg)("h3",{id:"generating-draws"},"Generating Draws"),(0,i.yg)("p",null,"The generation of ",(0,i.yg)("inlineCode",{parentName:"p"},"drawDefinitions")," requires a ",(0,i.yg)("inlineCode",{parentName:"p"},"tieFormat")," to determine how many ",(0,i.yg)("inlineCode",{parentName:"p"},"tieMatchUps")," for each collection are contained in the ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp")," between two teams.\nWhen ",(0,i.yg)("inlineCode",{parentName:"p"},"tieMatchUps")," are generated they are assigned a ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionId")," and a ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionPosition"),".\nIf there are six ",(0,i.yg)("inlineCode",{parentName:"p"},"tieMatchUps")," in a collection, they will be assigned ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionPositions")," ",(0,i.yg)("strong",{parentName:"p"},"1-6"),"."),(0,i.yg)("h3",{id:"mapping-lineups"},"Mapping lineUps"),(0,i.yg)("p",null,"A ",(0,i.yg)("inlineCode",{parentName:"p"},"tieFormat")," determines the relationship between a team's ",(0,i.yg)("inlineCode",{parentName:"p"},"lineUp")," and the ",(0,i.yg)("inlineCode",{parentName:"p"},"tieMatchUps")," within a ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp")," by defining the mapping between ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionIds"),", ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionPositions")," and participant ",(0,i.yg)("inlineCode",{parentName:"p"},"collectionAssignments"),"."),(0,i.yg)("h2",{id:"tieformat-example"},"tieFormat Example"),(0,i.yg)("ul",null,(0,i.yg)("li",{parentName:"ul"},"each ",(0,i.yg)("strong",{parentName:"li"},"SINGLES matchUp")," has a value of ",(0,i.yg)("strong",{parentName:"li"},"1")),(0,i.yg)("li",{parentName:"ul"},"the entire ",(0,i.yg)("strong",{parentName:"li"},"DOUBLES Collection")," has a value of ",(0,i.yg)("strong",{parentName:"li"},"1")),(0,i.yg)("li",{parentName:"ul"},"the ",(0,i.yg)("inlineCode",{parentName:"li"},"valueGoal")," is ",(0,i.yg)("strong",{parentName:"li"},"4"))),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-js"},"const tieFormat = {\n  winCriteria: {\n    valueGoal: 4, // the value that must be achieved to win the match\n  },\n  collectionDefinitions: [\n    {\n      collectionId: 'singlesCollectionId',\n      collectionGroupNumber: 1, // optional, if there are groups\n      collectionName: 'Singles',\n      matchUpFormat: 'SET3-S:6/TB7',\n      matchUpType: SINGLES,\n      matchUpCount: 6,\n      matchUpValue: 1, // value awarded for each matchUp win\n    },\n    {\n      collectionId: 'doublesCollectionId',\n      collectionGroupNumber: 1, // optional, if there are groups\n      collectionName: 'Doubles',\n      collectionValue: 1, // value awarded for winning one more than half of the matchUps in the collection\n      matchUpFormat: 'SET3-S:6/TB7-F:TB10',\n      matchUpType: DOUBLES,\n      matchUpCount: 3,\n    },\n  ],\n  // optional group details\n  collectionGroups: [\n    {\n      groupName: 'Day 1', // used to group collections, e.g. Laver Cup\n      groupNumber: 1,\n    },\n  ],\n};\n")),(0,i.yg)("h2",{id:"tieformat-and-lineup-propagation"},"tieFormat and lineUp propagation"),(0,i.yg)("p",null,(0,i.yg)("inlineCode",{parentName:"p"},"tieFormats")," can be attached to a tournament record at multiple levels wthin the hierarchy ",(0,i.yg)("inlineCode",{parentName:"p"},"event")," > ",(0,i.yg)("inlineCode",{parentName:"p"},"drawDefinition")," > ",(0,i.yg)("inlineCode",{parentName:"p"},"structure")," > ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp"),".\nThis means that when a ",(0,i.yg)("inlineCode",{parentName:"p"},"tieFormat")," is not present on a ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp")," the definition is resolved by walking the hierarchy.\nWhen a ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp")," is scored, the appropriate ",(0,i.yg)("inlineCode",{parentName:"p"},"tieFormat")," is attached to the ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp"),".\nThis is necessary because at any point in a ",(0,i.yg)("inlineCode",{parentName:"p"},"structure")," or ",(0,i.yg)("inlineCode",{parentName:"p"},"drawDefinition")," the scoped ",(0,i.yg)("inlineCode",{parentName:"p"},"tieFormat")," may be edite/changed;\nfor instance, if there is a rain delay, the format may be shortened for ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUps")," which have not yet been played.\nThe mapping between ",(0,i.yg)("inlineCode",{parentName:"p"},"participants")," in a ",(0,i.yg)("inlineCode",{parentName:"p"},"lineUp")," must be preserved for ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUps")," which are IN_PROGRESS or COMPLETED."),(0,i.yg)("p",null,"As TEAM ",(0,i.yg)("inlineCode",{parentName:"p"},"participants")," progress through draw ",(0,i.yg)("inlineCode",{parentName:"p"},"structures")," the most recent ",(0,i.yg)("inlineCode",{parentName:"p"},"lineUp")," is saved (via an ",(0,i.yg)("inlineCode",{parentName:"p"},"extension")," on the ",(0,i.yg)("inlineCode",{parentName:"p"},"drawDefinition"),") such that it can be propagated to subsequent ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUps"),".\nWhen a ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp")," is scored or the ",(0,i.yg)("inlineCode",{parentName:"p"},"lineUp")," changes, the ",(0,i.yg)("inlineCode",{parentName:"p"},"lineUp")," is saved directly to the target ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUp"),"."))}d.isMDXComponent=!0}}]);