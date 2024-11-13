"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3466],{3805:(e,r,t)=>{t.d(r,{xA:()=>d,yg:()=>g});var n=t(758);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function a(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=n.createContext({}),p=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):a(a({},r),e)),t},d=function(e){var r=p(e.components);return n.createElement(l.Provider,{value:r},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),c=p(t),f=o,g=c["".concat(l,".").concat(f)]||c[f]||u[f]||i;return t?n.createElement(g,a(a({ref:r},d),{},{components:t})):n.createElement(g,a({ref:r},d))}));function g(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var i=t.length,a=new Array(i);a[0]=f;var s={};for(var l in r)hasOwnProperty.call(r,l)&&(s[l]=r[l]);s.originalType=e,s[c]="string"==typeof e?e:o,a[1]=s;for(var p=2;p<i;p++)a[p]=t[p];return n.createElement.apply(null,a)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},637:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>l,contentTitle:()=>a,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var n=t(2232),o=(t(758),t(3805));const i={title:"Feed Policy"},a=void 0,s={unversionedId:"policies/feedPolicy",id:"policies/feedPolicy",title:"Feed Policy",description:'A _Feed Policy_ controls how participants are fed into CONSOLATION structures. For MAIN structures, participants are fed starting from final rounds, always "Top Down" and there are currently no policy configurations.',source:"@site/docs/policies/feedPolicy.md",sourceDirName:"policies",slug:"/policies/feedPolicy",permalink:"/tods-competition-factory/docs/policies/feedPolicy",draft:!1,tags:[],version:"current",frontMatter:{title:"Feed Policy"},sidebar:"docs",previous:{title:"Draws Policy",permalink:"/tods-competition-factory/docs/policies/draws"},next:{title:"Progression Policy",permalink:"/tods-competition-factory/docs/policies/progressionPolicy"}},l={},p=[{value:"<strong>feedFromMainFinal</strong>",id:"feedfrommainfinal",level:2},{value:"<strong>roundGroupedOrder</strong>",id:"roundgroupedorder",level:2},{value:"<strong>roundFeedProfiles</strong>",id:"roundfeedprofiles",level:2},{value:"EXAMPLE",id:"example",level:2}],d={toc:p},c="wrapper";function u(e){let{components:r,...t}=e;return(0,o.yg)(c,(0,n.A)({},d,t,{components:r,mdxType:"MDXLayout"}),(0,o.yg)("p",null,"A ",(0,o.yg)("strong",{parentName:"p"},(0,o.yg)("em",{parentName:"strong"},"Feed Policy"))," controls how participants are fed into CONSOLATION structures. For MAIN structures, participants are fed starting from ",(0,o.yg)("strong",{parentName:"p"},"final rounds"),', always "Top Down" and there are currently no policy configurations.'),(0,o.yg)("p",null,"Feeding participants into COSOLATION structures is controlled by the following attributes:"),(0,o.yg)("h2",{id:"feedfrommainfinal"},(0,o.yg)("strong",{parentName:"h2"},"feedFromMainFinal")),(0,o.yg)("p",null,"Allow participants to feed into CONSOLATION from MAIN final. This is considered an edge case and is ",(0,o.yg)("strong",{parentName:"p"},(0,o.yg)("em",{parentName:"strong"},"false"))," by default."),(0,o.yg)("h2",{id:"roundgroupedorder"},(0,o.yg)("strong",{parentName:"h2"},"roundGroupedOrder")),(0,o.yg)("p",null,"Controls the order in which participants are fed from rounds of the MAIN structure into round of a CONSOLATION structure. Works in conjunction with ",(0,o.yg)("strong",{parentName:"p"},"roundFeedProfiles"),". For every item in the ",(0,o.yg)("strong",{parentName:"p"},"roundGroupedOrder")," array there should be a corresponding directive in the ",(0,o.yg)("strong",{parentName:"p"},"roundFeedProfiles")," array."),(0,o.yg)("p",null,"Each array element is an array specifying how many divisions are to be made in the round being fed. For example, for a MAIN structure with 64 participants in the first round, 32 participants will be fed into the CONSOLATION structure. The array ",(0,o.yg)("strong",{parentName:"p"},"[1]")," specifies that these 16 participants should be treated as one group."),(0,o.yg)("p",null,"In the example given below, the third round grouped order is ",(0,o.yg)("strong",{parentName:"p"},"[1, 2]"),". This specifies that participants should be treated as two groups and that the first group will be processed first using the corresponding feed profile directive; in a draw of 64 when the feed profile is BOTTOM_UP this means that the first half of 16 players being fed into the third round will be fed as follows:"),(0,o.yg)("p",null,"[",(0,o.yg)("strong",{parentName:"p"},"1"),", 2]"," => ","[",(0,o.yg)("strong",{parentName:"p"},"8, 7, 6, 5, 4, 3, 2, 1"),", 16, 15, 14, 13, 12, 11, 10, 9]","."),(0,o.yg)("p",null,"The 8 players being fed in the fourth round start with the 3rd division, e.g. ","[5, 6]",". BOTTOM_UP reverses this to ","[6, 5]","."),(0,o.yg)("p",null,"[",(0,o.yg)("strong",{parentName:"p"},"3"),", 4, ",(0,o.yg)("strong",{parentName:"p"},"1"),", 2]"," => ","[",(0,o.yg)("strong",{parentName:"p"},"6, 5"),", 8, 7 , ",(0,o.yg)("strong",{parentName:"p"},"2, 1"),", 3, 4]"),(0,o.yg)("h2",{id:"roundfeedprofiles"},(0,o.yg)("strong",{parentName:"h2"},"roundFeedProfiles")),(0,o.yg)("p",null,"An array of directives specifying whether the feed for each fed round will be TOP_DOWN or BOTTOM_UP."),(0,o.yg)("h2",{id:"example"},"EXAMPLE"),(0,o.yg)("p",null,"This example is sufficient to cover MAIN draw sizes up to 128. This is because the fifth element of the ",(0,o.yg)("strong",{parentName:"p"},"roundGroupedOrder")," array corresponds to the eighth round of a CONSOLATION structure. With a 128 MAIN structure, fed rounds contain 64, 32, 16, 8, 4 and 2 participants. When a MAIN draw size is less than 128, the factory uses an internal method ",(0,o.yg)("inlineCode",{parentName:"p"},"reduceGroupOrder")," to ensure the number of array elements is never greater than the number of participants being fed."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const feedPolicy = {\n  feedFromMainFinal, // optional - defaults to false; drawSize: 4 will not feed from main final unless true\n  roundGroupedOrder: [\n    [1], // complete round TOP_DOWN\n    [1], // complete round BOTTOM_UP\n    [1, 2], // 1st half BOTTOM_UP, 2nd half BOTTOM_UP\n    [3, 4, 1, 2], // 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP, 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP\n    [2, 1, 4, 3, 6, 5, 8, 7], // 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP\n    [1], // complete round BOTTOM_UP\n  ],\n  roundFeedProfiles: [TOP_DOWN, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP],\n};\n")))}u.isMDXComponent=!0}}]);