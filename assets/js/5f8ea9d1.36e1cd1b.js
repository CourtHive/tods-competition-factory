"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[8300],{3805:(e,t,n)=>{n.d(t,{xA:()=>c,yg:()=>d});var i=n(758);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=i.createContext({}),l=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=l(e.components);return i.createElement(s.Provider,{value:t},e.children)},m="mdxType",g={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,s=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),m=l(n),u=a,d=m["".concat(s,".").concat(u)]||m[u]||g[u]||r;return n?i.createElement(d,o(o({ref:t},c),{},{components:n})):i.createElement(d,o({ref:t},c))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,o=new Array(r);o[0]=u;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p[m]="string"==typeof e?e:a,o[1]=p;for(var l=2;l<r;l++)o[l]=n[l];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}u.displayName="MDXCreateElement"},4501:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>g,frontMatter:()=>r,metadata:()=>p,toc:()=>l});var i=n(2232),a=(n(758),n(3805));const r={title:"Actions"},o=void 0,p={unversionedId:"concepts/actions",id:"concepts/actions",title:"Actions",description:"The engines of the Competition Factory preserve the integrity of tourtnament records,",source:"@site/docs/concepts/actions.mdx",sourceDirName:"concepts",slug:"/concepts/actions",permalink:"/tods-competition-factory/docs/concepts/actions",draft:!1,tags:[],version:"current",frontMatter:{title:"Actions"},sidebar:"docs",previous:{title:"Draw Types",permalink:"/tods-competition-factory/docs/concepts/draw-types"},next:{title:"Overview",permalink:"/tods-competition-factory/docs/concepts/scheduling-overview"}},s={},l=[{value:"positionActions",id:"positionactions",level:2},{value:"matchUpActions",id:"matchupactions",level:2}],c={toc:l},m="wrapper";function g(e){let{components:t,...n}=e;return(0,a.yg)(m,(0,i.A)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.yg)("p",null,"The engines of the Competition Factory preserve the integrity of tourtnament records,\nwhich means that errors are thrown when ",(0,a.yg)("strong",{parentName:"p"},"invalid")," actions are attempted, such as removing an outcome for a matchUp\nwhen participants have already progressed and completed subsequent matchUps in an elimination structure."),(0,a.yg)("p",null,"In developing a User Interface for interaction with draw structures it is useful to know in advance which actions are ",(0,a.yg)("strong",{parentName:"p"},"valid"),".\nThe Competition Factory exports two methods which return not only ",(0,a.yg)("inlineCode",{parentName:"p"},"validActions")," but also the ",(0,a.yg)("inlineCode",{parentName:"p"},"methods")," to perform each action,\nalong with both pre-populated parameters and valid values for parameters which are yet to be defined."),(0,a.yg)("h2",{id:"positionactions"},"positionActions"),(0,a.yg)("p",null,"Actions which are relevant to assigned positions within a draw structure."),(0,a.yg)("ul",null,(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Assign Participant"),": Assign accepted/selected participants to specified draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Set Nickname"),": Set a nickname for assigned participant (useful when players have excessively long names or multiple players have the same name)"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Assign Alternate"),": Assign participant from the list of alternates to specified draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Assign Qualifier"),": Assign qualifier from Qualifying structure to specified draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Assign Lucky Loser"),": Assign loser from Qualifying structure to specified draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Remove Assignment"),": Clear specified draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Withdraw Particiapnt"),": Clear specified draw position and withdraw participant from event"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Assign Bye"),": Assign a BYE to specified draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Set Seed Value"),": Assign custom seed value to participant at draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Remove Seed Value"),": Remove seed assignment from participant at draw position"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Swap Participants"),": Swap participant at specified draw position with any other positioned participant"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Modify Pair Assignment"),": Modify individual participant within a positioned doubles pair participant"),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Add Penalty"),": Record a penalty for participant at specified draw position")),(0,a.yg)("p",null,(0,a.yg)("a",{parentName:"p",href:"/docs/governors/query-governor#positionactions"},"askEngine.positionActions()")),(0,a.yg)("h2",{id:"matchupactions"},"matchUpActions"),(0,a.yg)("p",null,"Actions which are relevant to a specific ",(0,a.yg)("inlineCode",{parentName:"p"},"matchUp")," within a draw structure."),(0,a.yg)("ul",null,(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Set Score"),": Submit either complete or partial score for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Set Status"),": Submit ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUpStatus")," for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Set Schedule"),": Submit scheduling details for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Add Penalty"),": Record a penalty for participant at within specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Assign Referee"),": Set Referee Participant for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Set Start Time"),": Set start time for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Set End Time"),": Set end time for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Assign Lineup Position"),": In Team Events, assign participant to line up position for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Remove Lineup Position"),": In Team Events, remove participant from line up position for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Replace Lineup Position"),": In Team Events, replace participant assigned to line up position for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp")),(0,a.yg)("li",{parentName:"ul"},(0,a.yg)("strong",{parentName:"li"},"Substitute Position Participant"),": In Team Events, nominate substitute participant for line up position for specified ",(0,a.yg)("inlineCode",{parentName:"li"},"matchUp"))),(0,a.yg)("p",null,(0,a.yg)("a",{parentName:"p",href:"/docs/governors/query-governor#matchupactions"},"askEngine.matchUpActions()")))}g.isMDXComponent=!0}}]);