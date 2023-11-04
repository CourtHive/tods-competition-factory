"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3769],{8424:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>p,frontMatter:()=>r,metadata:()=>s,toc:()=>l});var o=t(1527),i=t(7942);const r={title:"mocksEngine API"},a=void 0,s={id:"apis/mocks-engine-api",title:"mocksEngine API",description:"anonymizeTournamentRecord",source:"@site/docs/apis/mocks-engine-api.md",sourceDirName:"apis",slug:"/apis/mocks-engine-api",permalink:"/tods-competition-factory/docs/apis/mocks-engine-api",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{title:"mocksEngine API"},sidebar:"docs",previous:{title:"Examples",permalink:"/tods-competition-factory/docs/engines/mocks-engine-examples"},next:{title:"Competition Engine",permalink:"/tods-competition-factory/docs/engines/competition-engine-overview"}},c={},l=[{value:"anonymizeTournamentRecord",id:"anonymizetournamentrecord",level:2},{value:"generateOutcome",id:"generateoutcome",level:2},{value:"generateOutcomeFromScoreString",id:"generateoutcomefromscorestring",level:2},{value:"generateParticipants",id:"generateparticipants",level:2},{value:"generateTournamentRecord",id:"generatetournamentrecord",level:2},{value:"Completing matchUps with outcomes",id:"completing-matchups-with-outcomes",level:3},{value:"modifyTournamentRecord",id:"modifytournamentrecord",level:2},{value:"parseScoreString",id:"parsescorestring",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.ah)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.h2,{id:"anonymizetournamentrecord",children:"anonymizeTournamentRecord"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"mocksEngine.anonymizeTournamentRecord({\n  tournamentRecord,\n  tournamentName, // optional - new tournamentName\n  personIds = [], // optional - array of UUIDs to be used for mocked person replacements\n  tournamentId, // optional - new tournamentId; default behavior is to generate a new one\n});\n"})}),"\n",(0,o.jsx)(n.hr,{}),"\n",(0,o.jsx)(n.h2,{id:"generateoutcome",children:"generateOutcome"}),"\n",(0,o.jsxs)(n.admonition,{type:"note",children:[(0,o.jsxs)(n.p,{children:[(0,o.jsx)(n.strong,{children:"matchUpStatusProfile"})," is an object containing the percentage chance specified matchUpStatuses will appear."]}),(0,o.jsxs)(n.p,{children:[(0,o.jsx)(n.code,{children:"matchUpStatusProfile: { [WALKOVER]: 100 }"})," will generate ",(0,o.jsx)(n.code,{children:"WALKOVER"})," 100% of the time."]})]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:'const { outcome } = mocksEngine.generateOutcome({\n  matchUpFormat, // optional - generate outcome with score constrained by matchUpFormat\n  matchUpStatusProfile: {}, // optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }\n  pointsPerMinute, // optional - defaults to 1 - used for generating timed set scores\n  winningSide: 1, // optional - to specify a specific winningSide\n  sideWeight, // optional - defaults to 4 - controls how often "deciding sets" are generated\n  defaultWithScorePercent, // optional - percentage change that an outcome with { matchUpStatus: DEFAULTED } will have a score\n});\n\nconst {\n  score: { sets, scoreStringSide1, side2ScoreString },\n  winningSide,\n  matchUpStatus,\n} = outcome;\n'})}),"\n",(0,o.jsx)(n.hr,{}),"\n",(0,o.jsx)(n.h2,{id:"generateoutcomefromscorestring",children:"generateOutcomeFromScoreString"}),"\n",(0,o.jsxs)(n.p,{children:["Generates ",(0,o.jsx)(n.code,{children:"outcome"})," object from parseable score string."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"const { outcome } = mocksEngine.generateOutcomeFromScoreString({\n  scoreString: '6-1 6-1', // parseable score string, always from the winner perspective\n  winningSide: 1, // optional - valid values are [1, 2, undefined]\n  matchUpStatus: COMPLETED,\n});\n"})}),"\n",(0,o.jsxs)(n.p,{children:["The ",(0,o.jsx)(n.code,{children:"outcome"})," object can be passed into the ",(0,o.jsx)(n.code,{children:"tournamentEngine"})," method for updating a ",(0,o.jsx)(n.code,{children:"matchUp"}),"."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"tournamentEngine.devContext(true).setMatchUpStatus({\n  matchUpId,\n  outcome,\n  drawId,\n});\n"})}),"\n",(0,o.jsx)(n.hr,{}),"\n",(0,o.jsx)(n.h2,{id:"generateparticipants",children:"generateParticipants"}),"\n",(0,o.jsxs)(n.p,{children:["Generate mock participants. This method is used within ",(0,o.jsx)(n.code,{children:"generateTournamentRecord"}),"; all parameters can be passed into ",(0,o.jsx)(n.code,{children:"generateTournamentRecord({ participantsProfile })"}),"."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"const { participants } = mocksEngine.generateParticipants({\n  participantsCount: 32, //  number of participants to generate\n  participantType: PAIR, // [INDIVIDUAL, PAIR, TEAM]\n  matchUpType: SINGLES, // optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES\n  sex: FEMALE, // optional - [MALE, FEMALE]\n\n  valuesInstanceLimit, // optional - maximum number of values which can be the same\n  nationalityCodesCount: 10, // optional - number of nationality codes to use when generating participants\n  nationalityCodeType: 'IOC', // optional - 'IOC' or 'ISO', defaults to ISO\n  nationalityCodes: [], // optional - an array of ISO codes to randomly assign to participants\n  addressProps: {\n    postalCodesCount: 10, // optional\n    postalCodesProfile, // optional { 12345: 12, 23456: 20 }\n    citiesCount: 10, // optional\n    citiesProfile, // optional { Atlanta: 10, Orlando: 5, \"New York\": 1 }\n    statesCount: 10, // optional\n    statesProfile, // optional { FL: 10, GA: 10, SC: 5, NC: 4, AL: 3 }\n  },\n  personExtensions, // optional array of extensions to attach to all generated persons\n  personData, //  optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]\n  personIds, // optional array of pre-defined personIds\n  idPrefix, // optional prefix used when generating participantids\n  uuids, // optional array of uuids to use as participantIds\n\n  category, // participant age and category scaleItems will be generated\n  consideredDate, // date from which category ageMaxDate and ageMinDate should be calculated (typically tournament.startDate or .endDate)\n  rankingRankge, // optional - range within which ranking numbers should be generated for specified category (non-rating)\n  scaledParticipantsCount, // optional - number of participants to assign rankings/ratings - defaults to ~25\n  scaleAllParticipants, // optional boolean - overrides scaledParticipantsCount\n\n  inContext: true, // optional - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects\n});\n\ntournamentEngine.addParticipants({ participants });\n"})}),"\n",(0,o.jsx)(n.hr,{}),"\n",(0,o.jsx)(n.h2,{id:"generatetournamentrecord",children:"generateTournamentRecord"}),"\n",(0,o.jsx)(n.p,{children:"Generate a complete tournamentRecord from the following attributes."}),"\n",(0,o.jsxs)(n.admonition,{type:"note",children:[(0,o.jsxs)(n.p,{children:["An additional attribute, ",(0,o.jsx)(n.code,{children:"teamKey"})," is available for ",(0,o.jsx)(n.code,{children:"participantsProfile"}),"."]}),(0,o.jsxs)(n.p,{children:[(0,o.jsx)(n.strong,{children:"TEAM"})," participants will be generated from the values of the specified attribute on ",(0,o.jsx)(n.strong,{children:"INDIVIDUAL"})," participants."]}),(0,o.jsxs)(n.p,{children:["See ",(0,o.jsx)(n.code,{children:"tournamentEngine.generateTeamsFromParticipantAttribute()"})," for more information."]})]}),"\n",(0,o.jsxs)(n.admonition,{type:"note",children:[(0,o.jsxs)(n.p,{children:["See ",(0,o.jsx)(n.a,{href:"/docs/concepts/scheduling#schedulingprofile",children:"Scheduling"})," for more information on schedulingProfiles."]}),(0,o.jsxs)(n.p,{children:["In the ",(0,o.jsx)(n.strong,{children:"mocksEngine"})," only:"]}),(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:["rounds can be targeted by providing only ",(0,o.jsx)(n.code,{children:"roundNumber"})," (defaults to first structure)"]}),"\n",(0,o.jsxs)(n.li,{children:["rounds can be targeted by ",(0,o.jsx)(n.code,{children:"winnerFinishingPositionRange"}),". E.g. '1-2' will target the final round."]}),"\n"]})]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"// Optional values -- see below\nconst outcomes = [\n  {\n    drawPositions: [1, 2],\n    scoreString: '6-1 6-2',\n    winningSide: 1,\n  },\n];\nconst drawProfiles = [\n  {\n    drawType: ROUND_ROBIN, // optional - defaults to SINGLE_ELIMINATION\n    drawSize: 4, // optional - defaults to 32\n    eventType: DOUBLES, // optional - defaults to SINGLES\n    seedsCount, // optional - number of particpants to be seeded\n    idPrefix, // optional prefix used for generation of matchUpIds\n    completionGoal, // optional - number of matchUps within draw structures to complete\n\n    participantsCount: 4, // optional - ability to specify fewer participants than drawSize to generate BYEs\n    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }\n    uniqueParticipants, // optional boolean - defaults to false - force generation of unique participants for a draw\n\n    matchUpFormat, // optional - applies only to { eventTypes: SINGLES or DOUBLES }\n    tieFormat, // optional - applies only when { eventType: TEAM }\n    outcomes,\n\n    // specify playoff structures from specific rounds to specific \"depths\"\n    withPlayoffs: {\n      roundProfiles: [{ 3: 1 }, { 4: 1 }], // create playoff structures from rounds 3 and 4\n      playoffPositions: [3, 4], // specific playoff positions for which structures must be generated\n      playoffAttributes: {\n        '0-3': { name: 'Silver', abbreviation: 'S' }, // specify name and abbreviation by \"structure exit profile\"\n        '0-4': { name: 'Gold', abbreviation: 'G' },\n      },\n    },\n  },\n];\n\n// drawProfiles are optional in eventProfiles; if present they can contain all attributes noted above\nconst eventProfiles = [\n  {\n    eventName: 'U18 Male Doubles',\n    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }\n    eventType: TEAM, // optional - defaults to SINGLES\n    gender: MALE,\n    drawProfiles: [\n      {\n        drawType, // optional\n        drawSize: 16, // required\n        completionGoal, // optional - number of matchUps within draw structures to complete\n      },\n    ],\n  },\n];\nconst venueProfiles = [\n  {\n    courtsCount: 3, // optional - count can be inferred from length of courtNames array\n    courtNames: [], // optional - unique names for courts to be applied by index\n    courtTimings: [], // optional [{ startTime, endTime }] to be applied by index\n    dateAvailability, // optional - will use tournament start and end dates and default times\n    venueName: 'Venue 1', // optional - will auto-generate names\n    venueAbbreviation, // optional\n    startTime, // optional court availability detail\n    courtIds, // optional\n    endTime, // optional court availability detail\n    idPrefix, // optional - prefix for courtIds\n    venuid, // optional\n  },\n];\n\nconst schedulingProfile = [\n  {\n    scheduleDate,\n    venues: [{ drawId, rounds: [] }], // see Concepts => Scheduling for more details\n  },\n];\n\nconst {\n  tournamentRecord,\n  drawIds: [drawId],\n  eventIds: [eventId],\n} = mocksEngine.generateTournamentRecord({\n  endDate, // optional - ISO string date\n  startDate, // optional - ISO string date\n  participantsProfile, // optional - { participantsCount, participantType } - see mocksEngine.generateParticipants()\n  policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }\n  matchUpStatusProfile, // optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }\n  drawProfiles, // optional - array of profiles for draws to be generated; each draw creates an event\n  eventProfiles, // optional - array of profiles for events to be generated; can include drawProfiles\n  venueProfiles, // optional - array of profiles for venues to be generated; each venue creates courts\n  completeAllMatchUps, // optional - boolean (legacy support for scoreString to be applied to all matchUps)\n  randomWinningSide, // optional - boolean; defaults to false which results in always { winningSide: 1 }\n  tournamentAttributes, // optionsl -object attributes will be applied to generated tournamentRecord\n  tournamentExtensions, // optional - array of extensions to be attached to tournamentRecord\n  uuids, // optional - array of uuids to be used in entity generators\n\n  autoSchedule, // optional - Boolean to call scheduleProfileRounds using the schedulingProfile\n  schedulingProfile, // optional - array of scheduling directives { scheduleDate, venues : [{ venue, rounds }]}\n});\n\ntournamentEngine.setState(tournamentRecord);\n"})}),"\n",(0,o.jsx)(n.admonition,{type:"note",children:(0,o.jsxs)(n.p,{children:["When using ",(0,o.jsx)(n.code,{children:"drawProfiles"})," participants in excess of ",(0,o.jsx)(n.code,{children:"drawSize"})," will be added with ",(0,o.jsx)(n.code,{children:"{ entryStatus: ALTERNATE }"}),",\nwhereas with ",(0,o.jsx)(n.code,{children:"eventProfiles"})," only the number of participants necessary to populate the draw are added with ",(0,o.jsx)(n.code,{children:"{ entryStatus: DIRECT_ACCEPTANCE }"}),"."]})}),"\n",(0,o.jsx)(n.h3,{id:"completing-matchups-with-outcomes",children:"Completing matchUps with outcomes"}),"\n",(0,o.jsxs)(n.p,{children:["The ",(0,o.jsx)(n.code,{children:"outcomes"})," attribute of ",(0,o.jsx)(n.code,{children:"drawProfiles"})," enables targeting specific ",(0,o.jsx)(n.code,{children:"matchUps"})," for completion. Once a ",(0,o.jsx)(n.code,{children:"structure"})," is targeted a ",(0,o.jsx)(n.code,{children:"matchUp"})," may be targeted by either roundNumber/roundPosition or drawPositions."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"const outcomes = {\n  drawPositions,\n  matchUpFormat,\n  matchUpIndex = 0,\n  matchUpStatus = COMPLETED,\n  roundNumber,\n  roundPosition,\n  scoreString,\n  stage = MAIN,\n  stageSequence = 1,\n  structureOrder, // group number for RR\n  winningSide,\n}\n"})}),"\n",(0,o.jsx)(n.hr,{}),"\n",(0,o.jsx)(n.h2,{id:"modifytournamentrecord",children:"modifyTournamentRecord"}),"\n",(0,o.jsxs)(n.p,{children:["Modify ",(0,o.jsx)(n.code,{children:"events"})," in an existing tournamentRecord, identified by either ",(0,o.jsx)(n.code,{children:"eventId"}),", ",(0,o.jsx)(n.code,{children:"eventIndex"}),", or ",(0,o.jsx)(n.code,{children:"eventName"}),"."]}),"\n",(0,o.jsxs)(n.p,{children:["Accepts the same attributes for ",(0,o.jsx)(n.code,{children:"eventProfiles"})," as ",(0,o.jsx)(n.code,{children:"generateTournamentRecord"}),"."]}),"\n",(0,o.jsxs)(n.p,{children:["The supplied ",(0,o.jsx)(n.code,{children:"tournamentRecord"})," is directly modified."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"eventProfiles = [\n  {\n    eventId, // optional - see above\n    eventName, // optional - see above\n    eventIndex, // optional - see above - zero based index into events array\n    drawProfiles: [\n      {\n        drawType, // optional\n        drawSize: 8, // required\n        completionGoal, // optional - number of matchUps within draw structures to complete\n      },\n    ],\n  },\n];\n\nmocksEngine.modifyTournamentRecord({\n  tournamentRecord,\n\n  participantsProfile, // optional - participants for events will be generated automatically\n  eventProfiles, // optional - see example usage for `generateTournamentRecord`\n  drawProfiles, // optional - see example usage for `generateTournamentRecord`\n  venueProfiles, // optional - see example usage for `generateTournamentRecord`\n  schedulingProfile, // optional - see example usage for `generateTournamentRecord`\n\n  completeAllMatchUps, // optional - boolean (legacy support for scoreString to be applied to all matchUps)\n  randomWinningSide, // optional - boolean; defaults to false which results in always { winningSide: 1 }\n\n  uuids, // optional - array of uuids for generated items\n});\n"})}),"\n",(0,o.jsx)(n.hr,{}),"\n",(0,o.jsx)(n.h2,{id:"parsescorestring",children:"parseScoreString"}),"\n",(0,o.jsx)(n.p,{children:"Produces TODS sets objects."}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-js",children:"const sets = mocksEngine.parseScoreString({ scoreString: '1-6 1-6' });\n\n/*\nconsole.log(sets)\n[\n  ({\n    side1Score: 1,\n    side2Score: 6,\n    side1TiebreakScore: undefined,\n    side2TiebreakScore: undefined,\n    winningSide: 2,\n    setNumber: 1,\n  },\n  {\n    side1Score: 1,\n    side2Score: 6,\n    side1TiebreakScore: undefined,\n    side2TiebreakScore: undefined,\n    winningSide: 2,\n    setNumber: 2,\n  })\n];\n*/\n"})}),"\n",(0,o.jsx)(n.hr,{})]})}function p(e={}){const{wrapper:n}={...(0,i.ah)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},7942:(e,n,t)=>{t.d(n,{ah:()=>l});var o=t(959);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,o,i=function(e,n){if(null==e)return{};var t,o,i={},r=Object.keys(e);for(o=0;o<r.length;o++)t=r[o],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)t=r[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var c=o.createContext({}),l=function(e){var n=o.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},d={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},p=o.forwardRef((function(e,n){var t=e.components,i=e.mdxType,r=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=l(t),m=i,h=u["".concat(c,".").concat(m)]||u[m]||d[m]||r;return t?o.createElement(h,a(a({ref:n},p),{},{components:t})):o.createElement(h,a({ref:n},p))}));p.displayName="MDXCreateElement"}}]);