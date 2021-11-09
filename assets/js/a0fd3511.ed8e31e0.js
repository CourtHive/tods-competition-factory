(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3769],{3905:function(e,n,t){"use strict";t.d(n,{Zo:function(){return l},kt:function(){return u}});var a=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,a,o=function(e,n){if(null==e)return{};var t,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var p=a.createContext({}),c=function(e){var n=a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},l=function(e){var n=c(e.components);return a.createElement(p.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},m=a.forwardRef((function(e,n){var t=e.components,o=e.mdxType,r=e.originalType,p=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),m=c(t),u=o,g=m["".concat(p,".").concat(u)]||m[u]||d[u]||r;return t?a.createElement(g,i(i({ref:n},l),{},{components:t})):a.createElement(g,i({ref:n},l))}));function u(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var r=t.length,i=new Array(r);i[0]=m;var s={};for(var p in n)hasOwnProperty.call(n,p)&&(s[p]=n[p]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var c=2;c<r;c++)i[c]=t[c];return a.createElement.apply(null,i)}return a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},3048:function(e,n,t){"use strict";t.r(n),t.d(n,{frontMatter:function(){return s},metadata:function(){return p},toc:function(){return c},default:function(){return d}});var a=t(4034),o=t(9973),r=(t(7294),t(3905)),i=["components"],s={title:"mocksEngine API"},p={unversionedId:"apis/mocks-engine-api",id:"apis/mocks-engine-api",isDocsHomePage:!1,title:"mocksEngine API",description:"anonymizeTournamentRecord",source:"@site/docs/apis/mocks-engine-api.md",sourceDirName:"apis",slug:"/apis/mocks-engine-api",permalink:"/tods-competition-factory/docs/apis/mocks-engine-api",version:"current",frontMatter:{title:"mocksEngine API"},sidebar:"docs",previous:{title:"Overview",permalink:"/tods-competition-factory/docs/apis/mocks-engine-overview"},next:{title:"Examples",permalink:"/tods-competition-factory/docs/engines/mocks-engine-examples"}},c=[{value:"anonymizeTournamentRecord",id:"anonymizetournamentrecord",children:[]},{value:"generateOutcome",id:"generateoutcome",children:[]},{value:"generateOutcomeFromScoreString",id:"generateoutcomefromscorestring",children:[]},{value:"generateParticipants",id:"generateparticipants",children:[]},{value:"generateTournamentRecord",id:"generatetournamentrecord",children:[]},{value:"modifyTournamentRecord",id:"modifytournamentrecord",children:[]},{value:"parseScoreString",id:"parsescorestring",children:[]}],l={toc:c};function d(e){var n=e.components,t=(0,o.Z)(e,i);return(0,r.kt)("wrapper",(0,a.Z)({},l,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"anonymizetournamentrecord"},"anonymizeTournamentRecord"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"mocksEngine.anonymizeTournamentRecord({\n  tournamentRecord,\n  tournamentName, // optional - new tournamentName\n  personIds = [], // optional - array of UUIDs to be used for mocked person replacements\n  tournamentId, // optional - new tournamentId; default behavior is to generate a new one\n});\n")),(0,r.kt)("hr",null),(0,r.kt)("h2",{id:"generateoutcome"},"generateOutcome"),(0,r.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},(0,r.kt)("strong",{parentName:"p"},"matchUpStatusProfile")," is an object containing the percentage chance specified matchUpStatuses will appear."),(0,r.kt)("p",{parentName:"div"},(0,r.kt)("inlineCode",{parentName:"p"},"matchUpStatusProfile: { [WALKOVER]: 100 }")," will generate ",(0,r.kt)("inlineCode",{parentName:"p"},"WALKOVER")," 100% of the time."))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},'const { outcome } = mocksEngine.generateOutcome({\n  matchUpFormat, // optional - generate outcome with score constrained by matchUpFormat\n  matchUpStatusProfile: {}, // optional - an empty object always returns { matchUpStatus: COMPLETED }\n  pointsPerMinute, // optional - defaults to 1 - used for generating timed set scores\n  winningSide: 1, // optional - to specify a specific winningSide\n  sideWeight, // optional - defaults to 4 - controls how often "deciding sets" are generated\n  defaultWithScorePercent, // optional - percentage change that an outcome with { matchUpStatus: DEFAULTED } will have a score\n});\n\nconst {\n  score: { sets, scoreStringSide1, side2ScoreString },\n  winningSide,\n  matchUpStatus,\n} = outcome;\n')),(0,r.kt)("hr",null),(0,r.kt)("h2",{id:"generateoutcomefromscorestring"},"generateOutcomeFromScoreString"),(0,r.kt)("p",null,"Generates ",(0,r.kt)("inlineCode",{parentName:"p"},"outcome")," object from parseable score string."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const { outcome } = mocksEngine.generateOutcomeFromScoreString({\n  scoreString: '6-1 6-1', // parseable score string\n  winningSide: 1, // optional - valid values are [1, 2, undefined]\n  matchUpStatus: COMPLETED,\n});\n")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"outcome")," object can be passed into the ",(0,r.kt)("inlineCode",{parentName:"p"},"tournamentEngine")," method for updating a ",(0,r.kt)("inlineCode",{parentName:"p"},"matchUp"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"tournamentEngine.devContext(true).setMatchUpStatus({\n  drawId,\n  matchUpId,\n  outcome,\n});\n")),(0,r.kt)("hr",null),(0,r.kt)("h2",{id:"generateparticipants"},"generateParticipants"),(0,r.kt)("p",null,"Generate mock participants. This method is used within ",(0,r.kt)("inlineCode",{parentName:"p"},"generateTournamentRecord"),"; all parameters can be passed into ",(0,r.kt)("inlineCode",{parentName:"p"},"generateTournamentRecord({ participantsProfile })"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const { participants } = mocksEngine.generateParticipants({\n  participantsCount: 32, //  number of participants to generate\n  participantType: PAIR, // [INDIVIDUAL, PAIR, TEAM]\n  matchUpType: SINGLES, // optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES\n  sex: FEMALE, // optional - [MALE, FEMALE]\n\n  valuesInstanceLimit, // optional - maximum number of values which can be the same\n  nationalityCodesCount: 10, // optional - number of nationality codes to use when generating participants\n  nationalityCodeType: 'ISO', // optional - 'IOC' or 'ISO', defaults to IOC\n  nationalityCodes: [], // optional - an array of ISO codes to randomly assign to participants\n  addressProps: {\n    citiesCount: 10,\n    statesCount: 10,\n    postalCodesCount: 10,\n  },\n  personExtensions, // optional array of extensions to attach to all generated persons\n  personData, //  optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]\n  personIds, // optional array of pre-defined personIds\n\n  category, // participant age and category scaleItems will be generated\n  consideredDate, // date from which category ageMaxDate and ageMinDate should be calculated (typically tournament.startDate or .endDate)\n  rankingRankge, // optional - range within which ranking numbers should be generated for specified category (non-rating)\n  scaledParticipantsCount, // optional - number of participants to assign rankings/ratings - defaults to ~25\n\n  inContext: true, // optional - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects\n});\n\ntournamentEngine.addParticipants({ participants });\n")),(0,r.kt)("hr",null),(0,r.kt)("h2",{id:"generatetournamentrecord"},"generateTournamentRecord"),(0,r.kt)("p",null,"Generate a complete tournamentRecord from the following attributes."),(0,r.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},"An additional attribute, ",(0,r.kt)("inlineCode",{parentName:"p"},"teamKey")," is available for ",(0,r.kt)("inlineCode",{parentName:"p"},"participantsProfile"),"."),(0,r.kt)("p",{parentName:"div"},(0,r.kt)("strong",{parentName:"p"},"TEAM")," participants will be generated from the values of the specified attribute on ",(0,r.kt)("strong",{parentName:"p"},"INDIVIDUAL")," participants."),(0,r.kt)("p",{parentName:"div"},"See ",(0,r.kt)("inlineCode",{parentName:"p"},"tournamentEngine.generateTeamsFromParticipantAttribute()")," for more information."))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"// Optional values\nconst outcomes = [\n  {\n    drawPositions: [1, 2],\n    scoreString: '6-1 6-2',\n    winningSide: 1,\n  },\n];\nconst drawProfiles = [\n  {\n    drawType: ROUND_ROBIN, // optional - defaults to SINGLE_ELIMINATION\n    drawSize: 4, // optional - defaults to 32\n    eventType: DOUBLES, // optional - defaults to SINGLES\n\n    participantsCount: 4, // optional - ability to specify fewer participants than drawSize to generate BYEs\n    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }\n    uniqueParticipants, // optional boolean - defaults to false - force generation of unique participants for a draw\n\n    matchUpFormat, // optional - applies only to { eventTypes: SINGLES or DOUBLES }\n    tieFormat, // optional - applies only when { eventType: TEAM }\n    outcomes,\n  },\n];\n\n// drawProfiles are optional in eventProfiles; if present they can contain all attributes noted above\nconst eventProfiles = [\n  {\n    eventName: 'U18 Boys Doubles',\n    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }\n    eventType: TEAM, // optional - defaults to SINGLES\n    gender: MALE,\n    drawProfiles: [\n      {\n        drawSize: 16, // required\n      },\n    ],\n  },\n];\nconst venueProfiles = [\n  {\n    courtsCount: 3, // optional - count can be inferred from length of courtNames array\n    courtNames: [], // optional\n    dateAvailability, // optional - will use tournament start and end dates and default times\n    venueName: 'Venue 1', // optional - will auto-generate names\n  },\n];\n\nconst {\n  tournamentRecord,\n  drawIds: [drawId],\n  eventIds: [eventId],\n} = mocksEngine.generateTournamentRecord({\n  endDate, // optional - ISO string date\n  startDate, // optional - ISO string date\n  participantsProfile, // optional - { participantCount, participantType } - see mocksEngine.generateParticipants()\n  policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }\n  matchUpStatusProfile, // optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }\n  drawProfiles, // optional - array of profiles for draws to be generated; each draw creates an event\n  eventProfiles, // optional - array of profiles for events to be generated; can include drawProfiles\n  venueProfiles, // optional - array of profiles for venues to be generated; each venue creates courts\n  completeAllMatchUps, // optional - boolean (legacy support for scoreString to be applied to all matchUps)\n  randomWinningSide, // optional - boolean; defaults to false which results in always { winningSide: 1 }\n  tournamentAttributes, // optionsl -object attributes will be applied to generated tournamentRecord\n  tournamentExtensions, // optional - array of extensions to be attached to tournamentRecord\n});\n\ntournamentEngine.setState(tournamentRecord);\n")),(0,r.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},"When using ",(0,r.kt)("inlineCode",{parentName:"p"},"drawProfiles")," participants in excess of ",(0,r.kt)("inlineCode",{parentName:"p"},"drawSize")," will be added with ",(0,r.kt)("inlineCode",{parentName:"p"},"{ entryStatus: ALTERNATE }"),",\nwhereas with ",(0,r.kt)("inlineCode",{parentName:"p"},"eventProfiles")," only the number of participants necessary to populate the draw are added with ",(0,r.kt)("inlineCode",{parentName:"p"},"{ entryStatus: DIRECT_ACCEPTANCE }"),"."))),(0,r.kt)("hr",null),(0,r.kt)("h2",{id:"modifytournamentrecord"},"modifyTournamentRecord"),(0,r.kt)("p",null,"Modify ",(0,r.kt)("inlineCode",{parentName:"p"},"events")," in an existing tournamentRecord. Accepts the same attributes for ",(0,r.kt)("inlineCode",{parentName:"p"},"eventProfiles")," as ",(0,r.kt)("inlineCode",{parentName:"p"},"generateTournamentRecord"),"."),(0,r.kt)("p",null,"The supplied ",(0,r.kt)("inlineCode",{parentName:"p"},"tournamentRecord")," is directly modified."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"eventProfiles = [\n  {\n    eventId, // optional - either eventId or eventName\n    eventName, // optional - either eventName or eventId\n    drawProfiles: [{ drawSize: 8 }],\n  },\n];\n\nmocksEngine.modifyTournamentRecord({\n  tournamentRecord,\n\n  participantsProfile, // optional - participants for events will be generated automatically\n  eventProfiles, // optional - see example usage for `generateTournamentRecord`\n});\n")),(0,r.kt)("hr",null),(0,r.kt)("h2",{id:"parsescorestring"},"parseScoreString"),(0,r.kt)("p",null,"Produces TODS sets objects."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const sets = mocksEngine.parseScoreString({ scoreString: '1-6 1-6' });\n\n/*\nconsole.log(sets)\n[\n  ({\n    side1Score: 1,\n    side2Score: 6,\n    side1TiebreakScore: undefined,\n    side2TiebreakScore: undefined,\n    winningSide: 2,\n    setNumber: 1,\n  },\n  {\n    side1Score: 1,\n    side2Score: 6,\n    side1TiebreakScore: undefined,\n    side2TiebreakScore: undefined,\n    winningSide: 2,\n    setNumber: 2,\n  })\n];\n*/\n")),(0,r.kt)("hr",null))}d.isMDXComponent=!0}}]);