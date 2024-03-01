"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[8148],{7942:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>y});var r=n(959);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),l=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=l(e.components);return r.createElement(p.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),u=l(n),m=a,y=u["".concat(p,".").concat(m)]||u[m]||d[m]||i;return n?r.createElement(y,o(o({ref:t},s),{},{components:n})):r.createElement(y,o({ref:t},s))}));function y(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=m;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[u]="string"==typeof e?e:a,o[1]=c;for(var l=2;l<i;l++)o[l]=n[l];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},7488:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>c,toc:()=>l});var r=n(8957),a=(n(959),n(7942));const i={title:"Participant Policy"},o=void 0,c={unversionedId:"policies/participantPolicy",id:"policies/participantPolicy",title:"Participant Policy",description:"A Participant Policy specifies which participant attributes will be present on participants returned via factory methods.",source:"@site/docs/policies/participantPolicy.md",sourceDirName:"policies",slug:"/policies/participantPolicy",permalink:"/tods-competition-factory/docs/policies/participantPolicy",draft:!1,tags:[],version:"current",frontMatter:{title:"Participant Policy"},sidebar:"docs",previous:{title:"Round Naming",permalink:"/tods-competition-factory/docs/policies/roundNaming"},next:{title:"Positioning Seeds",permalink:"/tods-competition-factory/docs/policies/positioningSeeds"}},p={},l=[{value:"Advanced Filtering",id:"advanced-filtering",level:2}],s={toc:l},u="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A ",(0,a.kt)("strong",{parentName:"p"},"Participant Policy")," specifies which participant attributes will be present on participants returned via factory methods."),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"The filters for Array elements are specified as Objects. In the example policy below, ",(0,a.kt)("inlineCode",{parentName:"p"},"individualParticipants")," filters the attributes of all members of the array in the source data")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const privacyPolicy = {\n  policyName: 'Participant Privacy Policy',\n  participant: {\n    individualParticipants: {\n      participantName: true,\n      participantOtherName: true,\n      participantId: true,\n      participantRole: true,\n      participantStatus: true,\n      representing: true,\n      participantType: true,\n      person: {\n        addresses: false,\n        nationalityCode: true,\n        otherNames: true,\n        sex: false,\n        standardFamilyName: true,\n        standardGivenName: true,\n      },\n    },\n    individualParticipantIds: true,\n    participantName: true,\n    participantOtherName: true,\n    participantId: true,\n    participantRole: true,\n    participantStatus: true,\n    representing: true,\n    participantType: true,\n    person: {\n      nationalityCode: true,\n      otherNames: true,\n      sex: false,\n      standardFamilyName: true,\n      standardGivenName: true,\n    },\n  },\n};\n")),(0,a.kt)("h2",{id:"advanced-filtering"},"Advanced Filtering"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Multible attributes may share the same privacy template via the use of ",(0,a.kt)("inlineCode",{parentName:"li"},"||")," syntax, as shown below."),(0,a.kt)("li",{parentName:"ul"},"Attributes which are strings may be used to filter the array objects in which they appear; e.g. ",(0,a.kt)("inlineCode",{parentName:"li"},"scaleName: ['WTN']")," will cause other ",(0,a.kt)("inlineCode",{parentName:"li"},"scaleItems")," to be filtered out."),(0,a.kt)("li",{parentName:"ul"},"A wildcard may be used to default all object attributes to ",(0,a.kt)("inlineCode",{parentName:"li"},"true"),", except those explicitly defined as ",(0,a.kt)("inlineCode",{parentName:"li"},"false"),".")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const privacyPolicy = {\n  /* ... */\n  ratings: {\n    'SINGLES||DOUBLES': {\n      scaleName: ['WTN'],\n      scaleValue: {\n        '*': true,\n        confidence: false,\n      },\n    },\n  },\n};\n")))}d.isMDXComponent=!0}}]);