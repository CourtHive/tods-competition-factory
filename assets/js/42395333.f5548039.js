"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[9718],{7942:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>g});var a=n(959);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=a.createContext({}),p=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return a.createElement(l.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=p(n),f=i,g=d["".concat(l,".").concat(f)]||d[f]||c[f]||r;return n?a.createElement(g,o(o({ref:t},u),{},{components:n})):a.createElement(g,o({ref:t},u))}));function g(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=f;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:i,o[1]=s;for(var p=2;p<r;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}f.displayName="MDXCreateElement"},8972:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>c,frontMatter:()=>r,metadata:()=>s,toc:()=>p});var a=n(8957),i=(n(959),n(7942));const r={title:"Generation Governor"},o=void 0,s={unversionedId:"governors/generation-governor",id:"governors/generation-governor",title:"Generation Governor",description:"drawMatic",source:"@site/docs/governors/generation-governor.md",sourceDirName:"governors",slug:"/governors/generation-governor",permalink:"/tods-competition-factory/docs/governors/generation-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"Generation Governor"},sidebar:"docs",previous:{title:"Event Governor",permalink:"/tods-competition-factory/docs/governors/event-governor"},next:{title:"matchUp Governor",permalink:"/tods-competition-factory/docs/governors/matchup-governor"}},l={},p=[{value:"drawMatic",id:"drawmatic",level:2},{value:"generateAdHocMatchUps",id:"generateadhocmatchups",level:2},{value:"generateAndPopulatePlayoffStructures",id:"generateandpopulateplayoffstructures",level:2},{value:"generateDrawDefinition",id:"generatedrawdefinition",level:2},{value:"generateDrawMaticRound",id:"generatedrawmaticround",level:2},{value:"generateFlightProfile",id:"generateflightprofile",level:2},{value:"generateLineUps",id:"generatelineups",level:2},{value:"generateQualifyingStructure",id:"generatequalifyingstructure",level:2},{value:"generateSeedingScaleItems",id:"generateseedingscaleitems",level:2},{value:"generateVolunataryConsolation",id:"generatevolunataryconsolation",level:2}],u={toc:p},d="wrapper";function c(e){let{components:t,...n}=e;return(0,i.kt)(d,(0,a.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"import { generationGovernor } from 'tods-competition-factory';\n")),(0,i.kt)("h2",{id:"drawmatic"},"drawMatic"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"drawMatic")," is a dynamic round generator for AD_HOC draws which produces participant pairings with previous opponent and team member avoidance.\nWhen ",(0,i.kt)("inlineCode",{parentName:"p"},"{ scaleName, scaleAccessor }")," values are present, participants will be paired for level-based play."),(0,i.kt)("p",null,"The number of rounds (",(0,i.kt)("inlineCode",{parentName:"p"},"roundsCount"),") that can be generated is limited to ",(0,i.kt)("strong",{parentName:"p"},"# participants - 1"),", which is the normal size of a Round Robin, unless ",(0,i.kt)("inlineCode",{parentName:"p"},"{ enableDoubleRobin: true }"),", in which case the upper limit is ",(0,i.kt)("strong",{parentName:"p"},"(# participants - 1) ","*"," 2"),"."),(0,i.kt)("p",null,"The number of participants is determined by the number of ",(0,i.kt)("strong",{parentName:"p"},"entries")," or the number of valid ",(0,i.kt)("inlineCode",{parentName:"p"},"{ participantIds }")," provided."),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"Inspired by the work of the Constantine who runs spectacular D3 College Tennis events using this format for flexible round generation when teams arrive and depart on different days.")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const { matchUps, participantIdPairings, iterations, candidatesCount } = engine.drawMatic({\n  restrictEntryStatus, // optional - only allow STRUCTURE_SELECTED_STATUSES\n  enableDoubleRobin, // optional - allows roundsCount <= (drawSize - 1) * 2\n  generateMatchUps, // optional - defaults to true; when false only returns { participantIdPairings }\n  participantIds, // optional array of [participantId] to restrict enteredParticipantIds which appear in generated round\n  maxIterations, // optional - defaults to 5000; can be used to set a limit on processing overhead\n  structureId, // optional; if no structureId is specified find the latest AD_HOC stage which has matchUps\n  matchUpIds, // optional array of uuids to be used when generating matchUps\n  eventType, // optional - override eventType of event within which draw appears; e.g. to force use of SINGLES ratings in DOUBLES events\n\n  scaleAccessor, // optional - string to access value within scaleValue, e.g. 'wtnRating'\n  scaleName, // optional - custom rating name to seed dynamic ratings\n\n  roundsCount, // REQUIRED - number of rounds to generate; limited to (1 - drawSize) unless { enableDoubleRobin: true }\n  drawId, // REQUIRED - drawId for which matchUps will be generated\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generateadhocmatchups"},"generateAdHocMatchUps"),(0,i.kt)("p",null,"Draws with ",(0,i.kt)("inlineCode",{parentName:"p"},"{ drawType: AD_HOC }")," allow ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps")," to be dynamically added. In this type of draw there is no automatic participant progression between rounds. Participant assignment to ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps")," is done manually, or via ",(0,i.kt)("strong",{parentName:"p"},"drawMatic"),". The only restriction is that a participant may appear once per round."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const result = engine.generateAdHocMatchUps({\n  participantIdPairings, // optional - array of array of pairings [['id1', 'id2'], ['id3', 'id4']]\n  drawId, // required - drawId of drawDefinition in which target structure is found\n  matchUpIds, // optional - if matchUpIds are not specified UUIDs are generated\n  roundNumber, // optional - specify round for which matchUps will be generated\n  newRound, // optional - boolean defaults to false - whether to auto-increment to next roundNumber\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generateandpopulateplayoffstructures"},"generateAndPopulatePlayoffStructures"),(0,i.kt)("p",null,"Generates values but does not attach them to the ",(0,i.kt)("inlineCode",{parentName:"p"},"drawDefinition"),". Used in conjunction with ",(0,i.kt)("inlineCode",{parentName:"p"},"attachPlayoffStructures"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const { structures, links, matchUpModifications } = engine.generateAndPopulatePlayoffStructures({\n  requireSequential, // boolean defaults to true; only applies to Round Robin; require finishingPositions to be sequential\n  roundNumbers: [3], // optional if playoffPositions not provided; roundNumbers of structure to be played off.\n  roundProfiles, // optional - source roundNumbers as Object.keys with depth as Object.values, e.g. [{ 1: 2}, {2: 1}]\n  playoffPositions: [3, 4], // optional if roundNumbers not provided; finishing positions to be played off.\n  playoffStructureNameBase, // optional - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'\n  exitProfileLimit, // limit playoff rounds generated by the attributes present in playoffAttributes\n  playoffAttributes, // optional - mapping of either exitProfile or finishingPositionRange to structure names, e.g. 0-1-1 for South\n  playoffGroups, // optional - only applies to Playoffs from ROUND_ROBIN: { structureNameMap: {}, finishingPositions: [], drawType: '' }\n  structureId,\n  drawId,\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generatedrawdefinition"},"generateDrawDefinition"),(0,i.kt)("p",null,"This is a convenience method which handles most use cases for draw generation."),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"automated"),' parameter is "truthy" and supports placing only seeded participants and any byes which are adjacent to seeded positions.\nSupport for this scenario is provided to enable some unique positioning strategies where unseeded participants have some agency in the selection process.'),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const drawDefinitionValues = {\n  eventId, // optional - used to find any avoidance policies to be applied\n  drawSize, // number of drawPositions in the first draw structure\n  drawType, // optional - defaults to SINGLE_ELIMINATION\n  drawName, // cutom name for generated draw structure(s)\n  drawEntries, // array of entries, equal to or a subset of event.entries\n  automated, // optional - whether or not to automatically place participants in structures; true/false or 'truthy' { seedsOnly: true }\n  matchUpType, // optional - SINGLES, DOUBLES, or TEAM\n  matchUpFormat, // optional - default matchUpFormatCode for all contained matchUps\n  playoffMatchUpFormat, // optional - relevant for ROUND_ROBIN_WITH_PLAYOFFS\n  hydrateCollections, // optional - propagate { category, gender } for event to collectionDefinitions in tieFormats\n  tieFormat, // optional - { collectionDefinitions, winCriteria } for 'dual' or 'tie' matchUps\n  seedsCount, // optional - number of seeds to generate if no seededParticipants provided\n  seededParticipants, // optional - { participantId: 'id', seedNumber: 1, seedValue, '1' }\n  seedingScaleName, // optional - custom scale for determining seeded participants\n\n  // { positioing: WATERFALL } seeding for ROUND_ROBIN structures\n  // { positioning: CLUSTER } or { positioning: SEPARATE } seeding for elimination structures\n  // { groupSeedingThreshold: 5 } will set seedValue to lowest value within all groups where seedNumber is > 5\n  seedingProfile, // optional { positioning, groupSeedingThreshold }\n\n  qualifyingPlaceholder, // optional boolean - generate a placeholder qualifying structure if qualifiersCount and no qualifyingProfiles\n  qualifiersCount, // optional - how many positionsAssignments will have { qualifier: true }\n  qualifyingOnly, // optional boolean - ignore event.entries that are not entryStage: QUALIFYING\n  qualifyingProfiles, // optional array [{ roundTarget, structureProfiles: [{ drawSize, seedsCount, seedingScaleName, qualifyingPositions }]}]\n\n  structureOptions: {\n    // optional - for ROUND_ROBIN - { groupSize, playoffGroups }\n    groupSize, // e.g. 4 participants per group\n    groupSizeLimit: 8,\n    playoffGroups: [\n      { finishingPositions: [1], structureName: 'Gold Flight', drawType }, // drawype defaults to SINGLE_ELIMINATION\n      { finishingPositions: [2], structureName: 'Silver Flight', drawType }, // drawType can also be COMPASS or FIRST_MATCH_LOSER_CONSOLATION\n    ],\n  },\n\n  staggeredEntry, // optional - accepts non-base-2 drawSizes and generates feed arms for \"extra\" drawPositions\n  policyDefinitions, // optional - seeding or avoidance policies to be used when placing participants\n  qualifyingPositions, // optional - number of positions in draw structure to be filled by qualifiers\n  playoffAttributes, // optional - map of { [finishingPositionRange || exitProfile]: { name: 'customName', abbreviation: 'A' } }\n  enforcePolicyLimits, // optional boolean - defaults to true - constrains seedsCount to policyDefinition limits\n  voluntaryConsolation, // optional { structureName, structureAbbreviation } - causes voluntary consolation structure to be added\n  enforceMinimumDrawSize, // optional boolean - defaults to true - false will allow generation of multi-structure drawTypes with only 2 participants\n  drawTypeCoercion, // optional boolean - coerce multi-structure drawTypes to SINGLE_ELIMINATION for drawSize: 2\n  ignoreStageSpace, // optional boolean - ignore wildcards count & etc.\n\n  compassAttributes, // optional - provide translations for name mappings\n  olympicAttributes, // optional - provide translations for name mappings\n};\n\nconst { drawDefinition } = engine.generateDrawDefinition(drawDefinitionValues);\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generatedrawmaticround"},"generateDrawMaticRound"),(0,i.kt)("p",null,"Typically not called directly. ",(0,i.kt)("inlineCode",{parentName:"p"},"engine.drawMatic")," is a higher level wrapper which automates derivation of ",(0,i.kt)("inlineCode",{parentName:"p"},"adHocRatings"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const {\n  participantIdPairings,\n  candidatesCount,\n  iterations,\n  matchUps,\n  success,\n} = generateDrawMaticRound({\n  maxIterations,// optional - defaults to 5000\n  generateMatchUps = true, // optional - defaults to true; when false only returns { participantIdPairings }\n  participantIds, // required\n  adHocRatings, // optional { ['participantId']: numericRating }\n  structureId, // required\n  matchUpIds, // optional array of uuids to be used when generating matchUps\n  eventType, // optional - override eventType of event within which draw appears; e.g. to force use of SINGLES ratings in DOUBLES events\n  drawId, // required\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generateflightprofile"},"generateFlightProfile"),(0,i.kt)("p",null,"Splits event entries into ",(0,i.kt)("inlineCode",{parentName:"p"},"flightsCount")," (# of draws). ",(0,i.kt)("inlineCode",{parentName:"p"},"flightProfile")," is an extension on an event which contains attributes to be used by ",(0,i.kt)("inlineCode",{parentName:"p"},"generateDrawDefinition"),"."),(0,i.kt)("p",null,"NOTE: The method returns ",(0,i.kt)("inlineCode",{parentName:"p"},"{ flightProfile, splitEntries }")," for testing; ",(0,i.kt)("inlineCode",{parentName:"p"},"splitEntries")," provides a breakdown on how ",(0,i.kt)("inlineCode",{parentName:"p"},"event.entries")," were split across each ",(0,i.kt)("inlineCode",{parentName:"p"},"flight")," within the ",(0,i.kt)("inlineCode",{parentName:"p"},"event"),"."),(0,i.kt)("p",null,"For an explanation of ",(0,i.kt)("inlineCode",{parentName:"p"},"scaleAttributes")," see ",(0,i.kt)("a",{parentName:"p",href:"../concepts/scaleItems"},"Scale Items"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const scaleAttributes = {\n  scaleType: RATING,\n  eventType: SINGLES,\n  scaleName: 'WTN',\n  accessor, // optional - string determining how to access attribute if scaleValue is an object\n};\n\nconst { flightProfile, splitEntries } = engine.generateFlightProfile({\n  eventId, // event for which entries will be split\n  attachFlightProfile, // boolean - also attach to event after generation\n  scaledEntries, // optional - overrides the use of scaleAttributes, scaleSortMethod, and sortDescending\n  scaleAttributes, // defines participant sort method prior to split\n  scaleSortMethod, // optional - function(a, b) {} sort method, useful when scaleValue is an object or further proessing is required\n  sortDescending, // optional - default sorting is ASCENDING; only applies to default sorting method.\n  flightsCount: 3, // number of draws to be created\n  deleteExisting: true, // optional - remove existing flightProfile\n  splitMethod: SPLIT_WATERFALL, // optional - defaults to SPLIT_LEVEL_BASED\n  drawNames: ['Green Flight', 'Blue Flight'], // optional\n  drawNameRoot: 'Flight', // optional - used to generate drawNames, e.g. 'Flight 1', 'Flight 2'\n});\n\nconst {\n  flights: [\n    {\n      drawId, // unique identifier for generating drawDefinitions\n      drawName, // custom name for generated draw\n      drawEntries, // entries allocated to target draw\n    },\n  ],\n} = flightProfile;\n\n// use flight information to generate drawDefinition\nconst {\n  flights: [flight],\n} = flightProfile;\n\nObject.assign(drawDefinitionValues, flight);\nconst { drawDefinition } = engine.generateDrawDefinition(drawDefinitionValues);\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generatelineups"},"generateLineUps"),(0,i.kt)("p",null,"Generates lineUps for TEAM events which have selected teams with ranked or rated individualParticipants. Individual TEAM participants are assigned line positions based on the scale specified."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const scaleAccessor = {\n  scaleName: categoryName,\n  scaleType: RANKING,\n  sortOrder, // optional - ASCENDING or DESCENDING - defaults to ASCENDING\n};\nconst { lineUps, participantsToAdd } = engine.generateLineUps({\n  useDefaultEventRanking, // optional boolen; when true scaleAccessor is not required\n  scaleAccessor, // see above\n  singlesOnly, // optional boolean - when true SINGLES rankings will be used for DOUBLES position assignment\n  attach, // optional boolean - when true the lineUps will be attached to the drawDefinition specified by drawId\n  drawId,\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generatequalifyingstructure"},"generateQualifyingStructure"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"let { structure, link } = engine.generateQualifyingStructure({\n  targetStructureId, // required: structure for which participants will qualify\n  qualifyingPositions, // optional: specify the # of qualifyingPositions\n  qualifyingRoundNumber, // optional: determine qualifyingPositions by # of matchUps in specified round; does not apply to ROUND_ROBIN\n  structureOptions, // optional: specific to ROUND_ROBIN generation\n  structureName, // optional\n  drawSize,\n  drawType, // optional: defaults to SINGLE_ELIMINATION\n  drawId, // required: draw within which target structure appears\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generateseedingscaleitems"},"generateSeedingScaleItems"),(0,i.kt)("p",null,"Used in conjunction with ",(0,i.kt)("inlineCode",{parentName:"p"},"getEntriesAndSeedsCount")," when it is necessary to make use of a custom function for generating ",(0,i.kt)("inlineCode",{parentName:"p"},"scaledEntries"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const { scaleItemsWithParticipantIds } = engine.generateSeedingScaleItems({\n  scaleAttributes,\n  scaledEntries,\n  stageEntries,\n  seedsCount,\n  scaleName,\n});\n")),(0,i.kt)("hr",null),(0,i.kt)("h2",{id:"generatevolunataryconsolation"},"generateVolunataryConsolation"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const { structures, links } = engine.generateVoluntaryConsolation({\n  automated: true,\n  drawId,\n});\n\n// if { attachConsolation: false } then it will be necessary to subsequently attach the structures and links\nengine.attachConsolationStructures({ drawId, structures, links });\n")),(0,i.kt)("hr",null))}c.isMDXComponent=!0}}]);