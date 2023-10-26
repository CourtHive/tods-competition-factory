"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2259],{7942:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var i=n(959);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=i.createContext({}),c=function(e){var t=i.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=c(e.components);return i.createElement(p.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},d=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=c(n),d=a,f=u["".concat(p,".").concat(d)]||u[d]||m[d]||r;return n?i.createElement(f,o(o({ref:t},s),{},{components:n})):i.createElement(f,o({ref:t},s))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,o=new Array(r);o[0]=d;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[u]="string"==typeof e?e:a,o[1]=l;for(var c=2;c<r;c++)o[c]=n[c];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}d.displayName="MDXCreateElement"},7461:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>m,frontMatter:()=>r,metadata:()=>l,toc:()=>c});var i=n(8957),a=(n(959),n(7942));const r={title:"Introduction to Policies"},o=void 0,l={unversionedId:"concepts/policies",id:"concepts/policies",title:"Introduction to Policies",description:"Policies determine how the various Competition Factory engines function and can shape the way that results are returned. Policies can be attached to the tournamentRecord, events, or to drawDefinitions within an event. They can also be passed directly into some factory methods; e.g. a Participant Policy can be passed into a method which returns particpipants and filter out attributes which are not to be displayed.",source:"@site/docs/concepts/policies.md",sourceDirName:"concepts",slug:"/concepts/policies",permalink:"/tods-competition-factory/docs/concepts/policies",draft:!1,tags:[],version:"current",frontMatter:{title:"Introduction to Policies"},sidebar:"docs",previous:{title:"Global State",permalink:"/tods-competition-factory/docs/concepts/globalState"},next:{title:"Introduction to Avoidance",permalink:"/tods-competition-factory/docs/policies/avoidance"}},p={},c=[{value:"Policy Types",id:"policy-types",level:2},{value:"Relevant Methods",id:"relevant-methods",level:2}],s={toc:c},u="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Policies determine how the various Competition Factory engines function and can shape the way that results are returned. Policies can be attached to the ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentRecord"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"events"),", or to ",(0,a.kt)("inlineCode",{parentName:"p"},"drawDefinitions")," within an ",(0,a.kt)("inlineCode",{parentName:"p"},"event"),". They can also be passed directly into some factory methods; e.g. a ",(0,a.kt)("strong",{parentName:"p"},"Participant Policy")," can be passed into a method which returns particpipants and filter out attributes which are not to be displayed."),(0,a.kt)("p",null,"The structure of a ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"policyDefinitions"))," object is as follows:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},"{\n  [policyType]: {      // e.g. 'seeding' or 'avoidance'\n    policyName: 'name'  // for 'seeding' can be the provider of the policy, e.g. 'ITF' or 'USTA'\n    ...attributes       // attributes relevant to the policyType\n  },\n  [anotherPolicyType]: {\n    policyName: 'name'\n    ...attributes\n  },\n}\n")),(0,a.kt)("h2",{id:"policy-types"},"Policy Types"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/avoidance"},"Avoidance Policy"),": Can be attached to drawDefinitions to specify the attriubutes by which participants should be separated"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/tods-competition-factory/docs/policies/participantPolicy"},"Participant Policy")," Enables participant details to be filtered to respect privacy concerns"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/positionActions"},"Position Actions Policy"),": Determines valid actions for positions in a draw structure"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/matchUpActions"},"MatchUp Actions Policy"),": Determines valid actions for matchUps (substitutions, penalties, referree, scheduling)"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/positioningSeeds"},"Seeding Policy"),": Sets seeding pattern and thresholds for number of seeds allowed for draw sizes"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/scheduling"},"Scheduling Policy"),": Defines average and rest/recovery times for matchUpFormats, categoryNames, and categoryTypes"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/tallyPolicy"},"Round Robin Tally Policy"),": Configures calculations which determine participant finishing positions"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/feedPolicy"},"Feed Policy"),": Determining the the patterns which direct participants into consolation feed rounds"),(0,a.kt)("li",{parentName:"ul"},"Progression Policy: Configuration related to participant progression, e.g. automatic qualifier placement, double-exit effects"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../policies/roundNaming"},"Round Naming Policy"),": Specifies how rounds of draw structures should be named"),(0,a.kt)("li",{parentName:"ul"},'Scoring Policy: Restricts available matchUpFormats, defines a default and conditions for "ready to score"'),(0,a.kt)("li",{parentName:"ul"},"Voluntary Consolation Policy: Specifies { winsLimit, finishingRoundLimit } for voluntary consolation eligibility")),(0,a.kt)("h2",{id:"relevant-methods"},"Relevant Methods"),(0,a.kt)("p",null,"Each of these methods can accept ",(0,a.kt)("inlineCode",{parentName:"p"},"policyDefinitions")," as a parameter."),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/competition-engine-api"},"competitionEngine.attachPolicies")," - attaches to all ",(0,a.kt)("inlineCode",{parentName:"li"},"tournamentRecords")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/competition-engine-api"},"competitionEngine.competitionParticipants")," - uses to filter participant attributes"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.attachPolicies")," - attaches to the current ",(0,a.kt)("inlineCode",{parentName:"li"},"tournamentRecord")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.attachEventPolicies")," - attaches to the ",(0,a.kt)("inlineCode",{parentName:"li"},"event")," specified by ",(0,a.kt)("inlineCode",{parentName:"li"},"eventId")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.autoSeeding")," - overrides present in ",(0,a.kt)("inlineCode",{parentName:"li"},"tournamentRecord")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.generateDrawDefinition")," - overrides those present in ",(0,a.kt)("inlineCode",{parentName:"li"},"tournamentRecord"),"; are attached to the generated ",(0,a.kt)("inlineCode",{parentName:"li"},"drawDefinition")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.getEventData")," - used to filter participant attributes"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.getAllEventData")," - used to filter participant attributes"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.getEntriesAndSeedsCount")," - overrides those present in the ",(0,a.kt)("inlineCode",{parentName:"li"},"event")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.getPolicyDefinitions")," - returns ",(0,a.kt)("inlineCode",{parentName:"li"},"policyDefinitions")," object constructed from specified ",(0,a.kt)("inlineCode",{parentName:"li"},"policyTypes")," found at different levels within a ",(0,a.kt)("inlineCode",{parentName:"li"},"tournamentRecord"),", depending on whether ",(0,a.kt)("inlineCode",{parentName:"li"},"eventId")," and ",(0,a.kt)("inlineCode",{parentName:"li"},"drawId")," are specified"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.getSeedsCount")," - overrides those present in ",(0,a.kt)("inlineCode",{parentName:"li"},"tournamentRecord")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.positionActions")," - can modify the avialable actions"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.tournamentParticipants")," - used to filter participant attributes"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/tournament-engine-api"},"tournamentEngine.publishEvent")," - used to filter particpant attributes and/or provide round naming values"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/draw-engine-api"},"drawEngine.attachPolicies")," - attaches to the current ",(0,a.kt)("inlineCode",{parentName:"li"},"drawDefinition")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"../apis/draw-engine-api"},"drawEngine.positionActions")," - can modify the avialable actions")))}m.isMDXComponent=!0}}]);