"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4950],{7942:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>g});var a=n(959);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var m=a.createContext({}),p=function(e){var t=a.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},c=function(e){var t=p(e.components);return a.createElement(m.Provider,{value:t},e.children)},l="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,m=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),l=p(n),d=r,g=l["".concat(m,".").concat(d)]||l[d]||u[d]||i;return n?a.createElement(g,s(s({ref:t},c),{},{components:n})):a.createElement(g,s({ref:t},c))}));function g(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,s=new Array(i);s[0]=d;var o={};for(var m in t)hasOwnProperty.call(t,m)&&(o[m]=t[m]);o.originalType=e,o[l]="string"==typeof e?e:r,s[1]=o;for(var p=2;p<i;p++)s[p]=n[p];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9369:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var a=n(8957),r=(n(959),n(7942));const i={title:"Time Items"},s=void 0,o={unversionedId:"concepts/timeItems",id:"concepts/timeItems",title:"Time Items",description:"timeItems can exist on any document element in TODS and are used to capture attributes which may change over time and where it is desierable to keep track of such changes.",source:"@site/docs/concepts/timeItems.md",sourceDirName:"concepts",slug:"/concepts/timeItems",permalink:"/tods-competition-factory/docs/concepts/timeItems",draft:!1,tags:[],version:"current",frontMatter:{title:"Time Items"},sidebar:"docs",previous:{title:"Scale Items",permalink:"/tods-competition-factory/docs/concepts/scaleItems"},next:{title:"Subscriptions",permalink:"/tods-competition-factory/docs/concepts/subscriptions"}},m={},p=[{value:"Object properties",id:"object-properties",level:2},{value:"itemType and itemSubTypes",id:"itemtype-and-itemsubtypes",level:3},{value:"Example itemTypes",id:"example-itemtypes",level:4},{value:"Internal usage",id:"internal-usage",level:2},{value:"Participants",id:"participants",level:3},{value:"matchUps",id:"matchups",level:3},{value:"Other use cases",id:"other-use-cases",level:2},{value:"Ranking and Ratings",id:"ranking-and-ratings",level:3},{value:"Adding a timeITem to an event",id:"adding-a-timeitem-to-an-event",level:4},{value:"Retrieving a timeITem from an event",id:"retrieving-a-timeitem-from-an-event",level:4}],c={toc:p},l="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(l,(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"timeItems")," can exist on any document element in TODS and are used to capture attributes which may change over time and where it is desierable to keep track of such changes."),(0,r.kt)("p",null,"For instance, a ",(0,r.kt)("strong",{parentName:"p"},"matchUp")," may be assigned to one court and scheduled, and then be interrupted and re-scheduled to start later on another court. ",(0,r.kt)("strong",{parentName:"p"},"matchUp")," ",(0,r.kt)("em",{parentName:"p"},"duration")," can be calculated from all ",(0,r.kt)("strong",{parentName:"p"},"timeItems")," which relate to the starting and stopping of play."),(0,r.kt)("h2",{id:"object-properties"},"Object properties"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const timeItem = {\n  itemType: 'SCALE.RANKING.SINGLES.WTN',\n  itemSubTypes; [], // optional\n  itemValue: 13.20,\n  itemDate: '2020-01-01T00:00',\n  createdAt: '2020-01-03T06:21'\n}\n")),(0,r.kt)("h3",{id:"itemtype-and-itemsubtypes"},"itemType and itemSubTypes"),(0,r.kt)("p",null,"itemType is a string, while itemSubTypes is an array of strings. In Competition Factory itemType uses dot notation to represent a hierarchical structure. This is useful for matching fragments of a type in some internal functions."),(0,r.kt)("h4",{id:"example-itemtypes"},"Example itemTypes"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"itemType: 'SCHEDULE.ASSIGNMENT.VENUE',\nitemType: 'SCHEDULE.ASSIGNMENT.COURT',\nitemType: 'SCHEDULE.ALLOCATION.COURTS', // team events\nitemType: 'SCHEDULE.ASSIGNMENT.OFFICIAL',\nitemType: 'SCHEDULE.COURT.ORDER', // pro-scheduling ORDER OF PLAY\nitemType: 'SCHEDULE.DATE',\nitemType: 'SCHEDULE.TIME.SCHEDULED',\nitemType: 'SCHEDULE.TIME.START',\nitemType: 'SCHEDULE.TIME.STOP',\nitemType: 'SCHEDULE.TIME.RESUME',\nitemType: 'SCHEDULE.TIME.END,\n")),(0,r.kt)("h2",{id:"internal-usage"},"Internal usage"),(0,r.kt)("p",null,"In most cases ",(0,r.kt)("strong",{parentName:"p"},"timeItems")," are used internally by the various Competition Factory engines."),(0,r.kt)("h3",{id:"participants"},"Participants"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"timeItems")," are used to track participant registration, sign-in and payment status as well as penalties and rankings and ratings values for different event categories. They are also used to capture manual seedings for events."),(0,r.kt)("h3",{id:"matchups"},"matchUps"),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"timeItems")," are used to capture scheduling attributes including start, stop, resume, end as well as assignment of court, referee & etc. Schedule related attributes are extracted from ",(0,r.kt)("strong",{parentName:"p"},"timeItems"),' when a matchUp is retrieved with "context" and added to the ',(0,r.kt)("strong",{parentName:"p"},"matchUp.schedule")," object."),(0,r.kt)("h2",{id:"other-use-cases"},"Other use cases"),(0,r.kt)("p",null,"Competition Factory defines methods for adding and retrieving arbitrary ",(0,r.kt)("strong",{parentName:"p"},"timeItems")," for the tournament record, event, and drawDefinitions."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"tournamentEngine.addTournamentTimeItem({ timeItem });\ntournamentEngine.addEventTimeItem({ eventId, timeItem });\ntournamentEngine.addDrawDefinitionTimeItem({ drawId, timeItem });\n\ntournamentEngine.getTournamentTimeItem({ itemType, itemSubTypes });\ntournamentEngine.getEventTimeItem({ eventId, itemType, itemSubTypes });\ntournamentEngine.getDrawDefinitionTimeItem({ drawId, itemType, itemSubTypes });\n")),(0,r.kt)("h3",{id:"ranking-and-ratings"},"Ranking and Ratings"),(0,r.kt)("p",null,"Sometimes a tournament organizer may want to fetch player Rankings and Ratings from a remote service. In such scenarios it is desireable to both capture a time stamp for when the last retrieval occurred and be able to query an event's ",(0,r.kt)("strong",{parentName:"p"},"timeItems")," to be able to display the value."),(0,r.kt)("h4",{id:"adding-a-timeitem-to-an-event"},"Adding a timeITem to an event"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const timeItem = {\n  itemType: 'RETRIEVAL.RANKING.SINGLES.U18',\n  itemValue: '2021-01-01T00:00',\n};\ntournamentEngine.addEventTimeItem({ eventId, timeItem });\n")),(0,r.kt)("h4",{id:"retrieving-a-timeitem-from-an-event"},"Retrieving a timeITem from an event"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const { timeItem: retrievedTimeItem, message } =\n  tournamentEngine.getEventTimeItem({\n    itemType: 'RETRIEVAL.RANKING.SINGLES.U18',\n    eventId,\n  });\n")))}u.isMDXComponent=!0}}]);