"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2122],{6034:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>g});var a=n(1258);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},s=Object.keys(e);for(a=0;a<s.length;a++)n=s[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(a=0;a<s.length;a++)n=s[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var i=a.createContext({}),l=function(e){var t=a.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=l(e.components);return a.createElement(i.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,s=e.originalType,i=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=l(n),d=r,g=m["".concat(i,".").concat(d)]||m[d]||u[d]||s;return n?a.createElement(g,c(c({ref:t},p),{},{components:n})):a.createElement(g,c({ref:t},p))}));function g(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var s=n.length,c=new Array(s);c[0]=d;var o={};for(var i in t)hasOwnProperty.call(t,i)&&(o[i]=t[i]);o.originalType=e,o[m]="string"==typeof e?e:r,c[1]=o;for(var l=2;l<s;l++)c[l]=n[l];return a.createElement.apply(null,c)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},4212:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>c,default:()=>u,frontMatter:()=>s,metadata:()=>o,toc:()=>l});var a=n(8957),r=(n(1258),n(6034));const s={title:"Scale Items"},c=void 0,o={unversionedId:"concepts/scaleItems",id:"concepts/scaleItems",title:"Scale Items",description:"scaleItems capture participant RANKING, RATING and SEEDING values. They are attached to participants as Time Items.",source:"@site/docs/concepts/scaleItems.md",sourceDirName:"concepts",slug:"/concepts/scaleItems",permalink:"/tods-competition-factory/docs/concepts/scaleItems",draft:!1,tags:[],version:"current",frontMatter:{title:"Scale Items"},sidebar:"docs",previous:{title:"Context / Hydration",permalink:"/tods-competition-factory/docs/concepts/participant-context"},next:{title:"Introduction to Policies",permalink:"/tods-competition-factory/docs/concepts/policies"}},i={},l=[{value:"Generating Seeding scaleItems",id:"generating-seeding-scaleitems",level:2},{value:"scaleItem Accessors",id:"scaleitem-accessors",level:2}],p={toc:l},m="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"scaleItems")," capture participant RANKING, RATING and SEEDING values. They are attached to ",(0,r.kt)("inlineCode",{parentName:"p"},"participants")," as ",(0,r.kt)("a",{parentName:"p",href:"./timeItems"},"Time Items"),".\nA participant can thus have multiple ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"scaleItems"))," for each event within a tournament."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const scaleItem = {\n  scaleValue: 8.3, // can be an integer, float or an object (see accessor below)\n  scaleName: 'WTN', // an arbitrary name, can be organization specific, e.g. 'NTRP' or 'UTR'\n  scaleType: RATING, //  RANKING, RATING, or SEEDING\n  eventType: SINGLES, // SINGLES, DOUBLES, or TEAM\n  scaleDate: '2020-06-06', // Ranking, Rating or Seeding date\n};\n\nengine.setParticipantScaleItem({\n  participantId,\n  scaleItem,\n});\n")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"scaleAttributes")," is an object with attribute values used to retrieve targetd ",(0,r.kt)("strong",{parentName:"p"},"scaleItems"),". The ",(0,r.kt)("strong",{parentName:"p"},"scaleValue")," with the latest date is returned."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const scaleAttributes = {\n  scaleType: RATING,\n  eventType: SINGLES,\n  scaleName: 'WTN',\n};\nconst { scaleItem } = engine.getParticipantScaleItem({\n  scaleAttributes,\n  participantId,\n});\n")),(0,r.kt)("h2",{id:"generating-seeding-scaleitems"},"Generating Seeding scaleItems"),(0,r.kt)("p",null,"Scale items may be generated automatically using ",(0,r.kt)("a",{parentName:"p",href:"/docs/governors/draws-governor#autoseeding"},"autoSeeding")," or ",(0,r.kt)("a",{parentName:"p",href:"/docs/governors/generation-governor#generateseedingscaleitems"},"generateSeedingScaleItems")," and then saved to participants with ",(0,r.kt)("a",{parentName:"p",href:"/docs/governors/participant-governor#setparticipantscaleitems"},"setParticipantScaleItems"),"."),(0,r.kt)("h2",{id:"scaleitem-accessors"},"scaleItem Accessors"),(0,r.kt)("p",null,"When ",(0,r.kt)("strong",{parentName:"p"},"scaleValues")," are objects, ",(0,r.kt)("strong",{parentName:"p"},"scaleAttributes")," may include an ",(0,r.kt)("strong",{parentName:"p"},"accessor")," describing an attribute path to a nested value."),(0,r.kt)("p",null,"See ",(0,r.kt)("a",{parentName:"p",href:"/docs/concepts/accessors"},"Accessors"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"// to access the value of a particular attribute...\nconst scaleValue = {\n  ntrpRating: 4.5\n  ratingYear: '2020',\n  ustaRatingType: 'C'\n};\n\n// provide an \"accessor\" describing the attribute path to the nested value in the scaleValue.\nconst scaleAttributes = {\n  accessor: 'ntrpRating',\n  eventType: DOUBLES,\n  scaleType: RATING,\n  scaleName: 'NTRP',\n};\n")))}u.isMDXComponent=!0}}]);