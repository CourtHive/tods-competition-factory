"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[1963],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>u});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=r.createContext({}),p=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},c=function(e){var n=p(e.components);return r.createElement(l.Provider,{value:n},e.children)},m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=p(t),u=a,f=d["".concat(l,".").concat(u)]||d[u]||m[u]||o;return t?r.createElement(f,i(i({ref:n},c),{},{components:t})):r.createElement(f,i({ref:n},c))}));function u(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=d;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=t[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},5722:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>i,default:()=>m,frontMatter:()=>o,metadata:()=>s,toc:()=>p});var r=t(7462),a=(t(7294),t(3905));const o={title:"Examples"},i=void 0,s={unversionedId:"engines/mocks-engine-examples",id:"engines/mocks-engine-examples",title:"Examples",description:"Simple Example",source:"@site/docs/engines/mocks-engine-examples.mdx",sourceDirName:"engines",slug:"/engines/mocks-engine-examples",permalink:"/tods-competition-factory/docs/engines/mocks-engine-examples",draft:!1,tags:[],version:"current",frontMatter:{title:"Examples"},sidebar:"docs",previous:{title:"mocksEngine API",permalink:"/tods-competition-factory/docs/apis/mocks-engine-api"},next:{title:"Competition Engine",permalink:"/tods-competition-factory/docs/engines/competition-engine-overview"}},l={},p=[{value:"Simple Example",id:"simple-example",level:3},{value:"drawProfiles",id:"drawprofiles",level:2},{value:"score completion",id:"score-completion",level:3},{value:"eventProfiles",id:"eventprofiles",level:2}],c={toc:p};function m(e){let{components:n,...t}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h3",{id:"simple-example"},"Simple Example"),(0,a.kt)("p",null,"Generates a tournament record with, by default, 32 participants."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const { tournamentRecord } = mocksEngine.generateTournamentRecord();\n")),(0,a.kt)("h2",{id:"drawprofiles"},"drawProfiles"),(0,a.kt)("p",null,"In testing, very specific scenarios are required. Any number of draws can be added to a generated tournament, and scores for specific ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUps")," within the generated draw structures can be added as well."),(0,a.kt)("p",null,"The completed ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUps")," in this example may be found by navigating in the ",(0,a.kt)("strong",{parentName:"p"},"Result")," panel below:"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"tournamentRecord => events[0] => drawDefinitions[0] => structures[0]")),(0,a.kt)("p",null,"See ",(0,a.kt)("a",{parentName:"p",href:"../concepts/context#matchups"},"Concepts => Context")," for more direct access to ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUps"),"."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function MocksEngineDemo(props) {\n  const drawProfiles = [\n    { drawSize: 8, eventType: 'DOUBLES' },\n    { drawSize: 4, drawType: 'ROUND_ROBIN' },\n  ];\n  const { tournamentRecord } = mocksEngine.generateTournamentRecord({\n    completeAllMatchUps: true,\n    drawProfiles,\n  });\n\n  return <Tournament data={tournamentRecord} />;\n}\n")),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("inlineCode",{parentName:"p"},"drawProfiles")," may contain any of the parameters normally passed to ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentEngine.generateDrawDefinition"),",\nwith the addition of ",(0,a.kt)("inlineCode",{parentName:"p"},"{ withPlayoffs }")," which may contain any of the parameters passed to ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentEngine.addPlayoffStructures()"),"."),(0,a.kt)("p",{parentName:"admonition"},"Additionally, the parameter ",(0,a.kt)("inlineCode",{parentName:"p"},"idPrefix")," may be used to define a string value to prepend generated ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUpIds"),", which will then include ",(0,a.kt)("inlineCode",{parentName:"p"},"roundNumber")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"roundPosition"),".")),(0,a.kt)("h3",{id:"score-completion"},"score completion"),(0,a.kt)("p",null,"In the following example a Doubles draw with 32 positions is generated with 30 PAIR participants, leaving two positions to be filled with BYEs. The score for the second ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUp")," in the first round is completed."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function MocksEngineDemo(props) {\n  const drawProfiles = [\n    {\n      drawSize: 32,\n      participantsCount: 30,\n      participantType: 'PAIR',\n      outcomes: [\n        {\n          roundNumber: 1,\n          roundPosition: 2,\n          scoreString: '6-1 6-2',\n          winningSide: 1,\n        },\n      ],\n    },\n  ];\n\n  const { tournamentRecord } = mocksEngine.generateTournamentRecord({\n    drawProfiles,\n  });\n\n  return <Tournament data={tournamentRecord} />;\n}\n")),(0,a.kt)("h2",{id:"eventprofiles"},"eventProfiles"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"eventProfiles")," enable multiple draws to be generated in a single event."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const eventProfiles = [\n  {\n    eventName: 'Event Flights Test',\n    eventType: SINGLES,\n    category: {\n      categoryName: 'U12',\n    },\n    matchUpFormat: FORMAT_STANDARD,\n    drawProfiles: [\n      {\n        drawSize: 16,\n        drawName: 'Qualifying Draw',\n        stage: QUALIFYING,\n      },\n      {\n        drawSize: 32,\n        qualifyingPositions: 4,\n        drawName: 'Main Draw',\n        drawType: COMPASS,\n      },\n      {\n        drawName: 'Consolation Draw',\n        stage: VOLUNTARY_CONSOLATION,\n      },\n    ],\n  },\n];\nconst {\n  eventIds: [eventId],\n  drawIds,\n} = mocksEngine.generateTournamentRecord({\n  eventProfiles,\n});\n")))}m.isMDXComponent=!0}}]);