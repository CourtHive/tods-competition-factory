"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3665],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>u});var o=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=o.createContext({}),p=function(e){var t=o.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},s=function(e){var t=p(e.components);return o.createElement(c.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},d=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=p(n),u=r,f=d["".concat(c,".").concat(u)]||d[u]||m[u]||i;return n?o.createElement(f,a(a({ref:t},s),{},{components:n})):o.createElement(f,a({ref:t},s))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,a=new Array(i);a[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,a[1]=l;for(var p=2;p<i;p++)a[p]=n[p];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}d.displayName="MDXCreateElement"},3533:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var o=n(7462),r=(n(7294),n(3905));const i={title:"lineUps"},a=void 0,l={unversionedId:"concepts/lineUp",id:"concepts/lineUp",title:"lineUps",description:"Overview",source:"@site/docs/concepts/lineUp.mdx",sourceDirName:"concepts",slug:"/concepts/lineUp",permalink:"/CourtHive/tods-competition-factory/docs/concepts/lineUp",draft:!1,tags:[],version:"current",frontMatter:{title:"lineUps"},sidebar:"docs",previous:{title:"Extensions",permalink:"/CourtHive/tods-competition-factory/docs/concepts/extensions"},next:{title:"tieFormats",permalink:"/CourtHive/tods-competition-factory/docs/concepts/tieFormat"}},c={},p=[{value:"Overview",id:"overview",level:2},{value:"lineUp Example",id:"lineup-example",level:2}],s={toc:p};function m(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,o.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"overview"},"Overview"),(0,r.kt)("p",null,"A ",(0,r.kt)("inlineCode",{parentName:"p"},"lineUp")," is provided by each side of a ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"Dual"))," or ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"Team"))," match;\nit is a mapping of team ",(0,r.kt)("inlineCode",{parentName:"p"},"participantIds")," to their ",(0,r.kt)("inlineCode",{parentName:"p"},"collectionAssignments")," which specify the ",(0,r.kt)("inlineCode",{parentName:"p"},"matchUps")," in which they will compete."),(0,r.kt)("h2",{id:"lineup-example"},"lineUp Example"),(0,r.kt)("p",null,"In this example, each team member, identified by their ",(0,r.kt)("inlineCode",{parentName:"p"},"participantId"),", is assigned to both a singles and a doubles ",(0,r.kt)("inlineCode",{parentName:"p"},"tieMatchUp"),".\nThey are assigned to ",(0,r.kt)("strong",{parentName:"p"},"different")," ",(0,r.kt)("inlineCode",{parentName:"p"},"collectionPositions")," in the singles collection, but the ",(0,r.kt)("strong",{parentName:"p"},"same")," ",(0,r.kt)("inlineCode",{parentName:"p"},"collectionPosition")," in the doubles collection,\nwhich means they also appear in the ",(0,r.kt)("inlineCode",{parentName:"p"},"tournamentRecord")," as a PAIR."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"[\n  {\n    participantId: 'pId1',\n    collectionAssignments: [\n      {\n        collectionId: 'singlesCollectionId',\n        collectionPosition: 1,\n      },\n      {\n        collectionId: 'doublesCollectionId',\n        collectionPosition: 1,\n      },\n    ],\n  },\n  {\n    participantId: 'pId2',\n    collectionAssignments: [\n      {\n        collectionId: 'singlesCollectionId',\n        collectionPosition: 2,\n      },\n      {\n        collectionId: 'doublesCollectionId',\n        collectionPosition: 1,\n      },\n    ],\n  },\n];\n")))}m.isMDXComponent=!0}}]);