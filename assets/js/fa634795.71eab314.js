(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[337],{3905:function(e,n,t){"use strict";t.d(n,{Zo:function(){return u},kt:function(){return m}});var r=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var c=r.createContext({}),l=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},u=function(e){var n=l(e.components);return r.createElement(c.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=l(t),m=o,g=d["".concat(c,".").concat(m)]||d[m]||p[m]||a;return t?r.createElement(g,i(i({ref:n},u),{},{components:t})):r.createElement(g,i({ref:n},u))}));function m(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=t.length,i=new Array(a);i[0]=d;var s={};for(var c in n)hasOwnProperty.call(n,c)&&(s[c]=n[c]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var l=2;l<a;l++)i[l]=t[l];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},5209:function(e,n,t){"use strict";t.r(n),t.d(n,{frontMatter:function(){return i},metadata:function(){return s},toc:function(){return c},default:function(){return u}});var r=t(2122),o=t(9756),a=(t(7294),t(3905)),i={title:"Generating Tournaments"},s={unversionedId:"engines/mocks-engine-examples",id:"engines/mocks-engine-examples",isDocsHomePage:!1,title:"Generating Tournaments",description:"The Mocks Engine is used to generate tournaments for many of the Jest tests suites used in the development of the Competition Factory.",source:"@site/docs/engines/mocks-engine-examples.md",sourceDirName:"engines",slug:"/engines/mocks-engine-examples",permalink:"/tods-competition-factory/docs/engines/mocks-engine-examples",version:"current",frontMatter:{title:"Generating Tournaments"},sidebar:"docs",previous:{title:"Subscriptions",permalink:"/tods-competition-factory/docs/concepts/subscriptions"},next:{title:"Mocks Engine API",permalink:"/tods-competition-factory/docs/apis/mocks-engine-api"}},c=[{value:"drawProfiles",id:"drawprofiles",children:[{value:"generateOutcomeFromScoreString",id:"generateoutcomefromscorestring",children:[]}]},{value:"eventProfiles",id:"eventprofiles",children:[]}],l={toc:c};function u(e){var n=e.components,t=(0,o.Z)(e,["components"]);return(0,a.kt)("wrapper",(0,r.Z)({},l,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"The Mocks Engine is used to generate tournaments for many of the Jest tests suites used in the development of the Competition Factory."),(0,a.kt)("p",null,"With no parameters the ",(0,a.kt)("inlineCode",{parentName:"p"},"generateTournamentRecord()")," method will generate a tournamentRecord with 32 individual participants:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const { tournamentRecord } = mocksEngine.generateTournamentRecord({});\n")),(0,a.kt)("h2",{id:"drawprofiles"},"drawProfiles"),(0,a.kt)("p",null,"In testing, very specific scenarios are required. Any number of draws can be added to a generated tournament, and scores for specific ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUps")," within the generated draw structures can be added as well. In the following example a Doubles draw with 32 positions is generated with 30 PAIR participants, leaving two positions to be filled with BYEs. The score is completed for the matchUp found using ",(0,a.kt)("inlineCode",{parentName:"p"},"{ roundNumber: 1, roundPosition: 2 }"),"."),(0,a.kt)("h3",{id:"generateoutcomefromscorestring"},"generateOutcomeFromScoreString"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"const { outcome } = mocksEngine.generateOutcomeFromScoreString()")," is used internally to generate a valid TODS score object."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const drawProfiles = [\n  {\n    drawSize: 32,\n    participantsCount: 30,\n    participantType: PAIR,\n    outcomes: [\n      {\n        roundNumber: 1,\n        roundPosition: 2,\n        scoreString: '6-1 6-2',\n        winningSide: 1,\n      },\n    ],\n  },\n];\n\nconst {\n  eventIds,\n  drawIds: [drawId],\n  tournamentRecord,\n} = mocksEngine.generateTournamentRecord({ drawProfiles });\n")),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"generateTournamentRecord()")," method returns an array of the ",(0,a.kt)("inlineCode",{parentName:"p"},"drawIds")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"eventIds")," present in the generated ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentRecord")," to aid in calling subsequent ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentEngine")," methods:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"tournamentEngine.setState(tournamentRecord);\n\nconst { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });\n")),(0,a.kt)("h2",{id:"eventprofiles"},"eventProfiles"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const eventProfiles = [\n  {\n    eventName: 'Event Flights Test',\n    eventType: SINGLES,\n    category: {\n      categoryName: 'U12',\n    },\n    matchUpFormat: FORMAT_STANDARD,\n    drawProfiles: [\n      {\n        drawSize: 16,\n        drawName: 'Qualifying Draw',\n        stage: QUALIFYING,\n      },\n      {\n        drawSize: 32,\n        qualifyingPositions: 4,\n        drawName: 'Main Draw',\n        drawType: COMPASS,\n      },\n      {\n        drawName: 'Consolation Draw',\n        stage: VOLUNTARY_CONSOLATION,\n      },\n    ],\n  },\n];\nconst {\n  eventIds: [eventId],\n  drawIds,\n} = mocksEngine.generateTournamentRecord({\n  eventProfiles,\n});\n")))}u.isMDXComponent=!0}}]);