"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2568],{9276:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>v});var r=n(5271);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),d=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},l=function(e){var t=d(e.components);return r.createElement(p.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},y=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),c=d(n),y=a,v=c["".concat(p,".").concat(y)]||c[y]||u[y]||i;return n?r.createElement(v,o(o({ref:t},l),{},{components:n})):r.createElement(v,o({ref:t},l))}));function v(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=y;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s[c]="string"==typeof e?e:a,o[1]=s;for(var d=2;d<i;d++)o[d]=n[d];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}y.displayName="MDXCreateElement"},7731:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var r=n(8957),a=(n(5271),n(9276));const i={title:"Entries Governor"},o=void 0,s={unversionedId:"governors/entries-governor",id:"governors/entries-governor",title:"Entries Governor",description:"addDrawEntries",source:"@site/docs/governors/entries-governor.md",sourceDirName:"governors",slug:"/governors/entries-governor",permalink:"/tods-competition-factory/docs/governors/entries-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"Entries Governor"},sidebar:"docs",previous:{title:"Draws Governor",permalink:"/tods-competition-factory/docs/governors/draws-governor"},next:{title:"Event Governor",permalink:"/tods-competition-factory/docs/governors/event-governor"}},p={},d=[{value:"addDrawEntries",id:"adddrawentries",level:2},{value:"addEventEntries",id:"addevententries",level:2},{value:"addEventEntryPairs",id:"addevententrypairs",level:2},{value:"checkValidEntries",id:"checkvalidentries",level:2},{value:"destroyGroupEntry",id:"destroygroupentry",level:2},{value:"destroyPairEntry",id:"destroypairentry",level:2},{value:"modifyEntriesStatus",id:"modifyentriesstatus",level:2},{value:"modifyEventEntries",id:"modifyevententries",level:2},{value:"setEntryPosition",id:"setentryposition",level:2},{value:"setEntryPositions",id:"setentrypositions",level:2}],l={toc:d},c="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"import { entriesGovernor } from 'tods-competition-factory';\n")),(0,a.kt)("h2",{id:"adddrawentries"},"addDrawEntries"),(0,a.kt)("p",null,"Bulk add an array of ",(0,a.kt)("inlineCode",{parentName:"p"},"participantIds")," to a specific ",(0,a.kt)("strong",{parentName:"p"},"stage")," of a draw with a specific ",(0,a.kt)("strong",{parentName:"p"},"entryStatus"),". Will fail if ",(0,a.kt)("inlineCode",{parentName:"p"},"participantIds")," are not already present in ",(0,a.kt)("inlineCode",{parentName:"p"},"event.entries"),". Use ",(0,a.kt)("inlineCode",{parentName:"p"},"addEventEntries")," to add to both ",(0,a.kt)("inlineCode",{parentName:"p"},"event")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"drawDefinition")," at the same time."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.addDrawEntries({\n  suppressDuplicateEntries, // do not throw error on duplicates; instead notify to DATA_ISSUE subscribers\n  ignoreStageSpace, // optional boolean to disable checking available positions\n  entryStageSequence, // optional - applies to qualifying\n  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments\n  entryStatus: ALTERNATE, // optional\n  entryStage: MAIN, // optional\n  participantIds,\n  eventId,\n  drawId,\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"addevententries"},"addEventEntries"),(0,a.kt)("p",null,"Adds ",(0,a.kt)("inlineCode",{parentName:"p"},"participantIds")," to ",(0,a.kt)("inlineCode",{parentName:"p"},"event.entries"),"; optionally pass drawId to add participantIds to ",(0,a.kt)("inlineCode",{parentName:"p"},"flightProfile.flight[].drawEntries")," at the same time."),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"Will ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"not"))," throw an error if unable to add entries into specified ",(0,a.kt)("inlineCode",{parentName:"p"},"flightProfile.flight[].drawEntries"),",\nwhich can occur if a ",(0,a.kt)("inlineCode",{parentName:"p"},"drawDefinition")," has already been generated and an attempt is made to add\na participant with ",(0,a.kt)("inlineCode",{parentName:"p"},"entryStatus: DIRECT_ACCEPTANCE"),".")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.addEventEntries({\n  suppressDuplicateEntries, // do not throw error on duplicates; instead notify to DATA_ISSUE subscribers\n  entryStatus: ALTERNATE, // optional; defaults to DIRECT_ACCEPTANCE\n  entryStage: MAIN, // optional; defaults to MAIN\n  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments\n  participantIds,\n  enforceGender, // optional - defaults to true\n  eventId,\n  drawId, // optional - will add participantIds to specified flightProfile.flight[].drawEntries and drawDefinition.entries (if possible)\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"addevententrypairs"},"addEventEntryPairs"),(0,a.kt)("p",null,"Add ",(0,a.kt)("strong",{parentName:"p"},"PAIR")," participant to an event. Creates new ",(0,a.kt)("inlineCode",{parentName:"p"},"{ participantType: PAIR }")," participants if the combination of ",(0,a.kt)("inlineCode",{parentName:"p"},"individualParticipantIds")," does not already exist."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.addEventEntryPairs({\n  allowDuplicateParticipantIdPairs, // optional - boolean - allow multiple pair participants with the same individualParticipantIds\n  uuids, // optional - array of UUIDs to use for newly created pairs\n  entryStatus: ALTERNATE, // optional\n  entryStage: QUALIFYING, // optional\n  participantIdPairs,\n  eventId,\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"checkvalidentries"},"checkValidEntries"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const { error, success } = engine.checkValidEntries({\n  consideredEntries, // optional array of entries to check\n  enforceGender, // optional boolean - defaults to true\n  eventId, // required\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"destroygroupentry"},"destroyGroupEntry"),(0,a.kt)("p",null,'Removes a "grouping" entry from a event and adds the ',(0,a.kt)("inlineCode",{parentName:"p"},"individualParticipantIds")," to entries. Grouping entries are ",(0,a.kt)("inlineCode",{parentName:"p"},"participantType")," ",(0,a.kt)("strong",{parentName:"p"},"TEAM")," and ",(0,a.kt)("strong",{parentName:"p"},"PAIR"),", both of which include ",(0,a.kt)("inlineCode",{parentName:"p"},"individualParticipantIds"),"."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.destroyGroupEntry({\n  participantId,\n  eventId,\n\n  entryStatus, // optional - new entryStatus for individualParticipantIds\n  removeGroupParticipant, // optional - removes group participant from tournament participants\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"destroypairentry"},"destroyPairEntry"),(0,a.kt)("p",null,"Removes a ",(0,a.kt)("inlineCode",{parentName:"p"},"{ participantType: PAIR }")," entry from an event and adds the individualParticipantIds to entries as entryStatus: UNGROUPED"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.destroyPairEntry({\n  participantId,\n  eventId,\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"modifyentriesstatus"},"modifyEntriesStatus"),(0,a.kt)("p",null,"Modify the entryStatus of participants already in an event or flight/draw. Does not allow participants assigned positions in structures to have an entryStatus of WITHDRAWN."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const result = engine.modifyEntriesStatus({\n  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments\n  participantIds, // ids of participants whose entryStatus will be modified\n  entryStatus, // new entryStatus\n  entryStage, // optional - e.g. QUALIFYING\n  eventSync, // optional - if there is only a single drawDefinition in event, keep event.entries in sync\n  extension, // optional - { name, value } - add if value; removes if value is undefined\n  eventId, // id of event where the modification(s) will occur\n  drawId, // optional - scope to a specific flight/draw\n  stage, // optional - scope to a specific stage\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"modifyevententries"},"modifyEventEntries"),(0,a.kt)("p",null,"Modify the entries for an event. For DOUBLES events automatically create PAIR participants if not already present."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.modifyEventEntries({\n  entryStatus = DIRECT_ACCEPTANCE,\n  unpairedParticipantIds = [],\n  participantIdPairs = [],\n  entryStage = MAIN,\n  eventId,\n})\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"setentryposition"},"setEntryPosition"),(0,a.kt)("p",null,"Set entry position a single event entry"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.setEntryPosition({\n  entryPosition,\n  participantId,\n  eventId, // optional if drawId is provided\n  drawId, // optional if eventId is provided\n});\n")),(0,a.kt)("hr",null),(0,a.kt)("h2",{id:"setentrypositions"},"setEntryPositions"),(0,a.kt)("p",null,"Set entry position for multiple event entries."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"engine.setEntryPositions({\n  entryPositions, // array of [{ entryPosition: 1, participantId: 'participantid' }]\n  eventId, // optional if drawId is provided\n  drawId, // optional if eventId is provided\n});\n")),(0,a.kt)("hr",null))}u.isMDXComponent=!0}}]);