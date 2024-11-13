"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[5875],{3805:(e,n,t)=>{t.d(n,{xA:()=>g,yg:()=>m});var a=t(758);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,a,r=function(e,n){if(null==e)return{};var t,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var d=a.createContext({}),s=function(e){var n=a.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},g=function(e){var n=s(e.components);return a.createElement(d.Provider,{value:n},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},u=a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,g=l(e,["components","mdxType","originalType","parentName"]),p=s(t),u=r,m=p["".concat(d,".").concat(u)]||p[u]||c[u]||i;return t?a.createElement(m,o(o({ref:n},g),{},{components:t})):a.createElement(m,o({ref:n},g))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var i=t.length,o=new Array(i);o[0]=u;var l={};for(var d in n)hasOwnProperty.call(n,d)&&(l[d]=n[d]);l.originalType=e,l[p]="string"==typeof e?e:r,o[1]=l;for(var s=2;s<i;s++)o[s]=t[s];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}u.displayName="MDXCreateElement"},1863:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var a=t(2232),r=(t(758),t(3805));const i={title:"Event Governor"},o=void 0,l={unversionedId:"governors/event-governor",id:"governors/event-governor",title:"Event Governor",description:"addDrawDefinition",source:"@site/docs/governors/event-governor.md",sourceDirName:"governors",slug:"/governors/event-governor",permalink:"/tods-competition-factory/docs/governors/event-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"Event Governor"},sidebar:"docs",previous:{title:"Entries Governor",permalink:"/tods-competition-factory/docs/governors/entries-governor"},next:{title:"Generation Governor",permalink:"/tods-competition-factory/docs/governors/generation-governor"}},d={},s=[{value:"addDrawDefinition",id:"adddrawdefinition",level:2},{value:"addEvent",id:"addevent",level:2},{value:"addFlight",id:"addflight",level:2},{value:"assignSeedPositions",id:"assignseedpositions",level:2},{value:"attachFlightProfile",id:"attachflightprofile",level:2},{value:"deleteDrawDefinitions",id:"deletedrawdefinitions",level:2},{value:"deleteEvents",id:"deleteevents",level:2},{value:"deleteFlightAndFlightDraw",id:"deleteflightandflightdraw",level:2},{value:"deleteFlightProfileAndFlightDraws",id:"deleteflightprofileandflightdraws",level:2},{value:"getCategoryAgeDetails",id:"getcategoryagedetails",level:2},{value:"modifyEvent",id:"modifyevent",level:2},{value:"modifyEventMatchUpFormatTiming",id:"modifyeventmatchupformattiming",level:2},{value:"modifyPairAssignment",id:"modifypairassignment",level:2},{value:"modifyTieFormat",id:"modifytieformat",level:2},{value:"promoteAlternates",id:"promotealternates",level:2},{value:"refreshEventDrawOrder",id:"refresheventdraworder",level:2},{value:"removeEventEntries",id:"removeevententries",level:2},{value:"removeEventExtension",id:"removeeventextension",level:2},{value:"removeEventMatchUpFormatTiming",id:"removeeventmatchupformattiming",level:2},{value:"removeScaleValues",id:"removescalevalues",level:2},{value:"removeSeeding",id:"removeseeding",level:2},{value:"setEventDates",id:"seteventdates",level:2},{value:"setEventDisplay",id:"seteventdisplay",level:2},{value:"updateDrawIdsOrder",id:"updatedrawidsorder",level:2},{value:"validateCategory",id:"validatecategory",level:2}],g={toc:s},p="wrapper";function c(e){let{components:n,...t}=e;return(0,r.yg)(p,(0,a.A)({},g,t,{components:n,mdxType:"MDXLayout"}),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"import { eventGovernor } from 'tods-competition-factory';\n")),(0,r.yg)("h2",{id:"adddrawdefinition"},"addDrawDefinition"),(0,r.yg)("p",null,"Adds a drawDefinition to an event in a tournamentRecord. Called after ",(0,r.yg)("a",{parentName:"p",href:"/docs/governors/generation-governor#generatedrawdefinition"},"generateDrawDefinition"),"."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"const { drawDefinition, error } = engine.generateDrawDefinition(drawDefinitionValues);\nif (!error) {\n  const result = engine.addDrawDefinition({\n    modifyEventEntries, // event.entries[{entryStatus}] are modified to match draw.entries[{entryStatus}]\n    existingDrawCount, // number of draws that exist in the event, used to check that two clients don't attempt to add simultaneously\n    allowReplacement, // optional - defaults to false\n    checkEntryStatus, // optional - defualts to false\n    drawDefinition,\n    eventId,\n    flight, // optional - pass flight definition object for integrity check\n  });\n}\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"addevent"},"addEvent"),(0,r.yg)("p",null,"Add an event object to a tournamentRecord."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.addEvent({ event });\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"addflight"},"addFlight"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.addFlight({\n  drawEntries, // optional\n  drawName,\n  eventId,\n  drawId, // optional -- if scenario involves client and server side tournamentEngines, provide { drawId: UUID() }\n  stage,\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"assignseedpositions"},"assignSeedPositions"),(0,r.yg)("p",null,"Assign ",(0,r.yg)("strong",{parentName:"p"},"seedNumbers")," to ",(0,r.yg)("strong",{parentName:"p"},"participantIds")," within a target draw structure."),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},"Provides the ability to assign seeding ",(0,r.yg)("em",{parentName:"li"},"after")," a structure has been generated"),(0,r.yg)("li",{parentName:"ul"},"To be used ",(0,r.yg)("em",{parentName:"li"},"before")," participants are positioned")),(0,r.yg)("p",null,(0,r.yg)("strong",{parentName:"p"},"seedNumber")," is unique while ",(0,r.yg)("strong",{parentName:"p"},"seedValue")," can be any string representation, e.g ",(0,r.yg)("inlineCode",{parentName:"p"},'"5-8"')),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.assignSeedPositions({\n  assignments, // [{ seedNumber: 1, seedValue: '1', participantId: 'pid' }];\n  structureId,\n  eventId,\n  drawId,\n\n  stage, // opional; defaults to { stage: MAIN }\n  stageSequence, // optional; defaults to { stageSequence: 1 }\n  useExistingSeedLimits, // optional; restrict ability to assign seedNumbers beyond established limit\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"attachflightprofile"},"attachFlightProfile"),(0,r.yg)("p",null,"Attaches a ",(0,r.yg)("inlineCode",{parentName:"p"},"flightProfile")," to the ",(0,r.yg)("inlineCode",{parentName:"p"},"event")," specified by ",(0,r.yg)("inlineCode",{parentName:"p"},"eventId"),". A ",(0,r.yg)("inlineCode",{parentName:"p"},"flightProfile")," is first generated with ",(0,r.yg)("inlineCode",{parentName:"p"},"generateFlightProfile()"),"."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.attachFlightProfile({ flightProfile, eventId });\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"deletedrawdefinitions"},"deleteDrawDefinitions"),(0,r.yg)("p",null,"Remove ",(0,r.yg)("inlineCode",{parentName:"p"},"drawDefinitions")," from an ",(0,r.yg)("inlineCode",{parentName:"p"},"event"),". An audit timeItem is added to the tournamentRecord whenever this method is called. If ",(0,r.yg)("inlineCode",{parentName:"p"},"autoPublish: true")," (default behavior) then if a deleted draw was published then the ",(0,r.yg)("inlineCode",{parentName:"p"},"event")," to which it belongs will be re-published."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.deleteDrawDefinitions({\n  autoPublish, // optional - defaults to true.\n  eventDataParams, // optional - params to pass to `getEventData` for regeneration of remaining draws\n  auditData, // object with attributes to be added to drawDeletions extension\n  drawIds: [drawId],\n  eventId,\n  force, // boolean - override error when scores present\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"deleteevents"},"deleteEvents"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.deleteEvents({ eventIds });\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"deleteflightandflightdraw"},"deleteFlightAndFlightDraw"),(0,r.yg)("p",null,"Removes flight from ",(0,r.yg)("inlineCode",{parentName:"p"},"event")," flightProfile as well as associated ",(0,r.yg)("inlineCode",{parentName:"p"},"drawDefinition")," (if generated)."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.deleteFlightAndFlightDraw({\n  autoPublish, // optional - defaults to true.\n  auditData, // object with attributes to be added to drawDeletions extension\n  eventId,\n  drawId,\n  force, // boolean - override error when scores present\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"deleteflightprofileandflightdraws"},"deleteFlightProfileAndFlightDraws"),(0,r.yg)("p",null,"Removes flightProfiles and all associated drawDefinitions from a specified event."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.deleteFlightProfileAndFlightDraws({\n  auditData, // object with attributes to be added to drawDeletions extension\n  eventId,\n  force, // boolean - override error when scores present\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"getcategoryagedetails"},"getCategoryAgeDetails"),(0,r.yg)("p",null,"Parses ",(0,r.yg)("inlineCode",{parentName:"p"},"ageCategoryCode")," to determine min/max eligible birthdates and min/max age. Category age/birthdate boundaries can be specified using other attributes.\nIf attributes are combined will sanity check correspondence and return an array of any encountered errors."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"const {\n  consideredDate, // returns either supplied value or date when invoked\n  combinedAge, // boolean indicating that ageMax and ageMin are combined values\n  ageMaxDate,\n  ageMinDate,\n  ageMax,\n  ageMin,\n  errors,\n} = engine.getCategoryAgeDetails({\n  consideredDate, // optional - date string 'YYYY-MM-DD'; defaults to current date\n  category: {\n    ageCategoryCode, // TODS code, e.g. 'U18', '18U', '18O', 'O18', '8O-U18', 'C50-70'\n    categoryName, // when no ageCategoryCode is provided, an attempt is made to find in categoryName\n    ageMaxDate, // latest/most recent date acceptable for eligibilty\n    ageMinDate, // earliest date acceptable for eligibility\n    ageMax, // maximum age acceptable for eligibility\n    ageMin, // minimum age acceptable for eligibility\n  },\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"modifyevent"},"modifyEvent"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"event.modifyEvent({\n  eventUpdates: {\n    eventGender, // optional - must validate against current event entries, if any\n    eventType, // optional - must validate against current event entries, if any\n    eventName, // optional\n    startDate, // optional - must fall within tournament dates\n    category, // optional - must validate against current event entries, if any\n    endDate, // optional - must fall within tournament dates\n  },\n  eventId,\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"modifyeventmatchupformattiming"},"modifyEventMatchUpFormatTiming"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.modifyEventMatchUpFormatTiming({\n  recoveryMinutes,\n  averageMinutes,\n  matchUpFormat,\n  eventId,\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"modifypairassignment"},"modifyPairAssignment"),(0,r.yg)("p",null,"Modifies an individualParticipantId within a PAIR particiapnt entered into an event or draw. Will clean up (delete) any PAIR participants that are not entered into any other draws or events."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.modifyPairAssignment({\n  replacementIndividualParticipantId,\n  existingIndividualParticipantId,\n  participantId,\n  eventId, // optional if drawId is provided\n  drawId, // optional if eventId is provided; scopes change to specified draw\n  uuids, // optional array of uuids for use when generating new participant\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"modifytieformat"},"modifyTieFormat"),(0,r.yg)("p",null,"Both modifies the ",(0,r.yg)("inlineCode",{parentName:"p"},"tieFormat")," on the target ",(0,r.yg)("inlineCode",{parentName:"p"},"event"),", ",(0,r.yg)("inlineCode",{parentName:"p"},"drawDefinition"),", ",(0,r.yg)("inlineCode",{parentName:"p"},"structure")," or ",(0,r.yg)("inlineCode",{parentName:"p"},"matchUp")," and adds/deletes ",(0,r.yg)("inlineCode",{parentName:"p"},"tieMatchUps")," as necessary."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.modifyTieFormat({\n  considerations, // optional { collectionName?: boolean; collectionOrder?: boolean };\n  modifiedTieFormat, // will be compared to existing tieFormat that is targeted and differences calculated\n  structureId, // required if modifying tieFormat for a structure\n  matchUpId, // required if modifying tieFormat for a matchUp\n  eventId, // required if modifying tieFormat for a event\n  drawId, // required if modifying tieFormat for a drawDefinition or a structure\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"promotealternates"},"promoteAlternates"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.promoteAlternates({\n  participantIds,\n  // either drawId or eventId are REQUIRED\n  eventId, // optional if drawId proided\n  drawId, // optional if eventId proided\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"refresheventdraworder"},"refreshEventDrawOrder"),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"removeevententries"},"removeEventEntries"),(0,r.yg)("p",null,"Removes ",(0,r.yg)("inlineCode",{parentName:"p"},"event.entries")," with integrity checks."),(0,r.yg)("p",null,"Filters ",(0,r.yg)("inlineCode",{parentName:"p"},"participantIds")," by specified ",(0,r.yg)("inlineCode",{parentName:"p"},"entryStatuses")," and/or ",(0,r.yg)("inlineCode",{parentName:"p"},"stage"),". If no ",(0,r.yg)("inlineCode",{parentName:"p"},"participantIds")," are provided, removes all ",(0,r.yg)("inlineCode",{parentName:"p"},"entries")," that match both ",(0,r.yg)("inlineCode",{parentName:"p"},"entryStatuses")," and ",(0,r.yg)("inlineCode",{parentName:"p"},"stage"),"."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.removeEventEntries({\n  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments\n  participantIds, // optional array of participantIds to remove\n  entryStatuses, // optional array of entryStatuses to remove\n  stage, // optional - remove entries for specified stage\n  eventId,\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"removeeventextension"},"removeEventExtension"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.removeEventExtension({ eventId, name });\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"removeeventmatchupformattiming"},"removeEventMatchUpFormatTiming"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.removeEventMatchUpFormatTiming({ eventId });\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"removescalevalues"},"removeScaleValues"),(0,r.yg)("p",null,"Removes scale values for participants in a particular event. Optionally restrict by draw or stage."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.removeScaleValues({\n  scaleAttributes, // { scaleType, scaleName, eventType }\n  scaleName, // optional - override default scaleName, event.category.categoryName || event.category.ageCategoryCode\n  drawId, // optional - to scope participants to entries in a specific draw\n  stage, // optinal - scope participants to entries in a specific stage of draw\n  eventId,\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"removeseeding"},"removeSeeding"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.removeSeeding({\n  entryStatuses, // optional array of entryStatues to consider\n  scaleName, // optional - override default scaleName, event.category.categoryName || event.category.ageCategoryCode\n  drawId, // optional - to scope participants to entries in a specific draw\n  stage, // optinal - scope participants to entries in a specific stage of draw\n  eventId,\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"seteventdates"},"setEventDates"),(0,r.yg)("p",null,"Where startDate and/or endDate are strings 'YYYY-MM-DD'. Can be used to set ",(0,r.yg)("inlineCode",{parentName:"p"},"startDate")," and ",(0,r.yg)("inlineCode",{parentName:"p"},"endDate")," independently."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.setEventDates({\n  activeDates, // optional array of dates from startDate to endDate\n  weekdays, // optional array of [MON, TUE, ...] // use { weekDayConstants }\n  startDate, // optional\n  endDate, // optional\n  eventId, // required\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"seteventdisplay"},"setEventDisplay"),(0,r.yg)("p",null,"Defines publish status for attributes of ",(0,r.yg)("inlineCode",{parentName:"p"},"participants")," and ",(0,r.yg)("inlineCode",{parentName:"p"},"matchUp")," schedules which are returned by ",(0,r.yg)("a",{parentName:"p",href:"/docs/governors/query-governor#geteventdata"},"getEventData")," and ",(0,r.yg)("a",{parentName:"p",href:"/docs/governors/query-governor#competitionschedulematchups"},"competitionScheduleMatchUps"),"."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"const displaySettings = {\n  draws: {\n    default: {\n      participantAttributes: { [key]: boolean },\n      // an array of attribute settings to be applied to specified dates\n      scheduleDetails: [\n        {\n          attributes: { scheduledTime: false },\n          dates: [], // empty array or undefined specifies that attribute setting apply to all scheduledDates\n        },\n      ],\n    },\n    [drawId]: {},\n  },\n};\n\nengine.setEventDisplay({\n  displaySettings,\n  eventId,\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"updatedrawidsorder"},"updateDrawIdsOrder"),(0,r.yg)("p",null,"Updates the ",(0,r.yg)("inlineCode",{parentName:"p"},"drawOrder")," attribute of all ",(0,r.yg)("inlineCode",{parentName:"p"},"drawDefinitions")," within an event. The ",(0,r.yg)("inlineCode",{parentName:"p"},"drawOrder")," attribute can be used for sorting or for differentiating ",(0,r.yg)("inlineCode",{parentName:"p"},"drawDefinitions"),' for the award of rankings points, when "flighting" separates participants by some ',(0,r.yg)("inlineCode",{parentName:"p"},"scaleValue"),"."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.updateDrawIdsOrder({\n  eventId,\n  orderedDrawIdsMap: {\n    'id-Of-draw-1': 1,\n    'id-of-draw-2': 2,\n  },\n});\n")),(0,r.yg)("hr",null),(0,r.yg)("h2",{id:"validatecategory"},"validateCategory"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"engine.validateCategory({ category });\n")))}c.isMDXComponent=!0}}]);