"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[596],{7942:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var i=n(959);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=i.createContext({}),l=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},c=function(e){var t=l(e.components);return i.createElement(p.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},h=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,p=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=l(n),h=r,m=d["".concat(p,".").concat(h)]||d[h]||u[h]||o;return n?i.createElement(m,a(a({ref:t},c),{},{components:n})):i.createElement(m,a({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,a=new Array(o);a[0]=h;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[d]="string"==typeof e?e:r,a[1]=s;for(var l=2;l<o;l++)a[l]=n[l];return i.createElement.apply(null,a)}return i.createElement.apply(null,n)}h.displayName="MDXCreateElement"},1052:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>a,default:()=>u,frontMatter:()=>o,metadata:()=>s,toc:()=>l});var i=n(8957),r=(n(959),n(7942));const o={title:"Publishing"},a=void 0,s={unversionedId:"concepts/publishing",id:"concepts/publishing",title:"Publishing",description:"Overview",source:"@site/docs/concepts/publishing.md",sourceDirName:"concepts",slug:"/concepts/publishing",permalink:"/tods-competition-factory/docs/concepts/publishing",draft:!1,tags:[],version:"current",frontMatter:{title:"Publishing"},sidebar:"docs",previous:{title:"Feed Policy",permalink:"/tods-competition-factory/docs/policies/feedPolicy"},next:{title:"Scheduling",permalink:"/tods-competition-factory/docs/concepts/scheduling"}},p={},l=[{value:"Overview",id:"overview",level:2},{value:"Event draws",id:"event-draws",level:2},{value:"Scheduled matchUps",id:"scheduled-matchups",level:2}],c={toc:l},d="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,i.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"overview"},"Overview"),(0,r.kt)("p",null,"Publishing is both a mechanism for controlling what information is available for public display and a means of triggering a notification to subscribers of various publishing-related topics."),(0,r.kt)("h2",{id:"event-draws"},"Event draws"),(0,r.kt)("p",null,"Control of public display of draw structures is provided by ",(0,r.kt)("a",{parentName:"p",href:"/tods-competition-factory/docs/apis/tournament-engine-api#publishevent"},"tournamentEngine.publishEvent"),"; when this method is called a ",(0,r.kt)("inlineCode",{parentName:"p"},"timeItem")," is attached to an event which directs filtering of draws and structures within draws and a notification is pushed to subscribers of the PUBLISH_EVENT topic."),(0,r.kt)("p",null,"The methods ",(0,r.kt)("a",{parentName:"p",href:"/tods-competition-factory/docs/apis/tournament-engine-api#geteventdata"},"tournamentEnigne.getEventData")," and ",(0,r.kt)("a",{parentName:"p",href:"/tods-competition-factory/docs/apis/competition-engine-api#competitionschedulematchups"},"competitionEngine.competitionScheduleMatchUps")," utilize the PUBLISH.STATUS ",(0,r.kt)("inlineCode",{parentName:"p"},"timeItem")," values when passed the parameter ",(0,r.kt)("inlineCode",{parentName:"p"},"{ usePublishState: true }")," to filter the data they return."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"// publish all draws containted within event specified by eventId\ntournamentEngine.publishEvent({ eventId });\n\n// publish specified drawId\ntournamentEngine.publishEvent({\n  drawDetails: {\n    ['drawId']: { publishingDetail: { published: true } },\n  },\n  eventId,\n});\n\n// alternative shorthand for publishing drawId(s)\ntournamentEngine.publishEvent({ eventId, drawIdsToAdd: ['drawId'] });\n\n// unpublish specified drawId(s)\ntournamentEngine.publishEvent({ eventId, drawIdsToRemove: ['drawId'] });\n\n// publish only QUALIFYING stage of specified drawId\ntournamentEngine.publishEvent({\n  drawDetails: { ['drawId']: { stagesToAdd: [QUALIFYING] } },\n  eventId,\n});\n")),(0,r.kt)("h2",{id:"scheduled-matchups"},"Scheduled matchUps"),(0,r.kt)("p",null,"Control of public display of scheduled matchUps is provided by ",(0,r.kt)("a",{parentName:"p",href:"/tods-competition-factory/docs/apis/tournament-engine-api#publishorderofplay"},"tournamentEngine.publishOrderOfPlay")," and ",(0,r.kt)("a",{parentName:"p",href:"/tods-competition-factory/docs/apis/competition-engine-api#publishorderofplay"},"competitionEngine.publishOrderOfPlay"),"; when either of these methods is called a ",(0,r.kt)("inlineCode",{parentName:"p"},"timeItem")," is attached to the tournament which directs filtering of matchUps and a notification is pushed to subscribers of the PUBLISH_ORDER_OF_PLAY topic."),(0,r.kt)("p",null,"The method ",(0,r.kt)("a",{parentName:"p",href:"/tods-competition-factory/docs/apis/competition-engine-api#competitionschedulematchups"},"competitionEngine.competitionScheduleMatchUps")," utilizes the PUBLISH.STATUS ",(0,r.kt)("inlineCode",{parentName:"p"},"timeItem")," values when passed the parameter ",(0,r.kt)("inlineCode",{parentName:"p"},"{ usePublishState: true }")," to filter the matchUps which are returned in ",(0,r.kt)("inlineCode",{parentName:"p"},"dateMatchUps"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"competitionEngine.publishOrderOfPlay({\n  removePriorValues: true, // when true remove all previous timeItems related to publishing Order of Play\n  scheduledDates, // optional - if not provided will publish all scheduledDates\n  eventIds, // optional - if not provided will publish all eventIds\n});\n\nconst { dateMatchUps } = competitionEngine.competitionScheduleMatchUps({\n  usePublishState: true,\n});\n")))}u.isMDXComponent=!0}}]);