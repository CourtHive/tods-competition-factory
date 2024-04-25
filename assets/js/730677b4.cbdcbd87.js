"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2438],{6034:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>b});var r=n(1258);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),d=u(n),h=i,b=d["".concat(s,".").concat(h)]||d[h]||c[h]||a;return n?r.createElement(b,l(l({ref:t},p),{},{components:n})):r.createElement(b,l({ref:t},p))}));function b(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=h;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[d]="string"==typeof e?e:i,l[1]=o;for(var u=2;u<a;u++)l[u]=n[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}h.displayName="MDXCreateElement"},6705:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>a,metadata:()=>o,toc:()=>u});var r=n(8957),i=(n(1258),n(6034));const a={title:"Publishing Governor"},l=void 0,o={unversionedId:"governors/publishing-governor",id:"governors/publishing-governor",title:"Publishing Governor",description:"getPublishState",source:"@site/docs/governors/publishing-governor.md",sourceDirName:"governors",slug:"/governors/publishing-governor",permalink:"/tods-competition-factory/docs/governors/publishing-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"Publishing Governor"},sidebar:"docs",previous:{title:"Policy Governor",permalink:"/tods-competition-factory/docs/governors/policy-governor"},next:{title:"Query Governor",permalink:"/tods-competition-factory/docs/governors/query-governor"}},s={},u=[{value:"getPublishState",id:"getpublishstate",level:2},{value:"publishEvent",id:"publishevent",level:2},{value:"publishEventSeeding",id:"publisheventseeding",level:2},{value:"publishOrderOfPlay",id:"publishorderofplay",level:2},{value:"publishParticipants",id:"publishparticipants",level:2},{value:"unPublishEventSeeding",id:"unpublisheventseeding",level:2},{value:"unPublishOrderOfPlay",id:"unpublishorderofplay",level:2},{value:"unPublishParticipants",id:"unpublishparticipants",level:2}],p={toc:u},d="wrapper";function c(e){let{components:t,...n}=e;return(0,i.kt)(d,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"import { publishingGovernor } from 'tods-competition-factory';\n")),(0,i.kt)("h2",{id:"getpublishstate"},"getPublishState"),(0,i.kt)("p",null,"Return publishing details for tournament, event(s), and/or draws."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"// return status for all events and tournament `orderOfPlay`\npublishState = engine.getPublishState().publishState;\nconst participantsPublished = publishState.tournament.participants.published;\nconst orderOfPlayPublished = publishState.tournament.orderOfPlay.published;\n// status returned for all events within tournamentRecord, accessed by eventId\nconst { published, publishedDrawIds, drawDetails } = publishState['eventId'].status;\n\n// publishState for specific event\npublishState = engine.getPublishState({ eventId }).publishState;\nconst eventPublished = publishState.status.published;\n\n// publishState for specific draw\npublishState = engine.getPublishState({ drawId }).publishState;\nconst drawPublished = publishState.status.published;\n// when only specific stages or structures are published\nconst drawPublishDetail = publishState.status.drawDetail;\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"publishevent"},"publishEvent"),(0,i.kt)("p",null,"Utilizes ",(0,i.kt)("a",{parentName:"p",href:"/docs/governors/event-governor#geteventdata"},"getEventData")," to prepare data for display. Differs from ",(0,i.kt)("a",{parentName:"p",href:"/docs/governors/event-governor#geteventdata"},"getEventData")," in that it modifies the ",(0,i.kt)("inlineCode",{parentName:"p"},"publishState")," of the event. Subscriptions or middleware may be used to deliver the generated payload for presentation on a public website."),(0,i.kt)("p",null,"See ",(0,i.kt)("a",{parentName:"p",href:"../concepts/policies"},"Policies")," for more details on ",(0,i.kt)("inlineCode",{parentName:"p"},"policyDefinitions")," and ",(0,i.kt)("a",{parentName:"p",href:"/tods-competition-factory/docs/concepts/publishing"},"Publishing")," for more on use cases."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const policyDefinitions = Object.assign({}, ROUND_NAMING_POLICY, PARTICIPANT_PRIVACY_DEFAULT);\n\nconst { eventData } = engine.publishEvent({\n  removePriorValues, // optional boolean - when true will delete prior timeItems\n  policyDefinitions, // optional - e.g. participant privacy policy (if not already attached)\n  eventDataParams, // optional - params to pass to `getEventData`\n\n  drawIdsToRemove, // optional - drawIds to remove from drawIds already published\n  drawIdsToAdd, // optional - drawIds to add to drawIds already published\n\n  drawDetails, // { [drawId]: { structureDetails, stageDetails, publishingDetail: { published: true, embargo: UTC Date string } }}\n\n  eventId, // required - eventId of event to publish\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"publisheventseeding"},"publishEventSeeding"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.publishEventSeeding({\n  removePriorValues, // optional boolean - when true will delete prior timeItems\n  stageSeedingScaleNames, // { MAIN: 'mainScaleName', QUALIFYING: 'qualifyingScaleName' } - required if a distinction is made between MAIN and QUALIFYING seeding\n  seedingScaleNames, // optional\n  drawIds, // optional - publish specific drawIds (flights) within the event\n  eventId,\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"publishorderofplay"},"publishOrderOfPlay"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.publishOrderOfPlay({\n  removePriorValues, // optional boolean - when true will delete prior timeItems\n  scheduledDates, // optional - if not provided will publish all scheduledDates\n  eventIds, // optional - if not provided will publish all eventIds\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"publishparticipants"},"publishParticipants"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.publishParticipants({\n  removePriorValues, // optional boolean - when true will delete prior timeItems\n})\n\n---\n\n## unPublishEvent\n\nModifies the `publishState` of an event. `Subscriptions` or middleware can be used to trigger messaging to services which make event data visible on public websites.\n\n```js\nengine.unPublishEvent({\n  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems\n  eventId,\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"unpublisheventseeding"},"unPublishEventSeeding"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.unPublishEventSeeding({\n  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems\n  stages, // optionally specify array of stages to be unpublished, otherwise unpublish all stages\n  eventId,\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"unpublishorderofplay"},"unPublishOrderOfPlay"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.unPublishOrderOfPlay({\n  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"unpublishparticipants"},"unPublishParticipants"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"engine.unPublishParticipants({\n  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems\n});\n")),(0,i.kt)("hr",null))}c.isMDXComponent=!0}}]);