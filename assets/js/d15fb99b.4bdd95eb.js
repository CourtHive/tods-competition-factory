"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[1691],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>h});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=a.createContext({}),p=function(e){var t=a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},l=function(e){var t=p(e.components);return a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,c=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),u=p(n),h=r,m=u["".concat(c,".").concat(h)]||u[h]||d[h]||i;return n?a.createElement(m,o(o({ref:t},l),{},{components:n})):a.createElement(m,o({ref:t},l))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=u;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:r,o[1]=s;for(var p=2;p<i;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},4220:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var a=n(7462),r=(n(7294),n(3905));const i={title:"Introduction to Avoidance",menu:"Draw Engine"},o=void 0,s={unversionedId:"policies/avoidance",id:"policies/avoidance",title:"Introduction to Avoidance",description:"Avoidance is an attempt to ensure that grouped players do not encounter each other in early rounds (or just the first round) of an elimination draw structure, or that round robin brackets are generated such that players from the same group are evenly distributed across brackets and do not encounter each other unless there are more group members than there are brackets.",source:"@site/docs/policies/avoidance.md",sourceDirName:"policies",slug:"/policies/avoidance",permalink:"/CourtHive/tods-competition-factory/docs/policies/avoidance",draft:!1,tags:[],version:"current",frontMatter:{title:"Introduction to Avoidance",menu:"Draw Engine"},sidebar:"docs",previous:{title:"Introduction to Policies",permalink:"/CourtHive/tods-competition-factory/docs/concepts/policies"},next:{title:"Accessors",permalink:"/CourtHive/tods-competition-factory/docs/policies/accessors"}},c={},p=[{value:"Single Round Avoidance",id:"single-round-avoidance",level:2},{value:"Multiple Round Avoidance",id:"multiple-round-avoidance",level:2},{value:"Avoidance Policies",id:"avoidance-policies",level:2}],l={toc:p};function d(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Avoidance is an attempt to ensure that grouped players do not encounter each other in early rounds (or just the first round) of an elimination draw structure, or that round robin brackets are generated such that players from the same group are evenly distributed across brackets and do not encounter each other unless there are more group members than there are brackets."),(0,r.kt)("p",null,"Avoidance can be applied to ",(0,r.kt)("a",{parentName:"p",href:"./positioningSeeds#seed-blocks"},"Seed Blocks")," as well as unseeded players, though Seeded players may only be moved to other positions valid for the Seed Block within which they are placed."),(0,r.kt)("h2",{id:"single-round-avoidance"},"Single Round Avoidance"),(0,r.kt)("p",null,"Single Round Avoidance an be accomplished by random placement followed by an iterative shuffling algorithm which generates a score for each player distribution and which runs through a set number of iterations, or by iterative attempts to resolve conflicts by searching for alternate player positions. In some cases where single round avoidance is the goal it is specifically forbidden to attempt to maximize player separation within a draw."),(0,r.kt)("h2",{id:"multiple-round-avoidance"},"Multiple Round Avoidance"),(0,r.kt)("p",null,"Multiple Round Avoidance seeks to place players as far apart within a draw structure as possible. This can be accomplished by dividing a draw structure into sections based on the number of players within a given group and distributing a group's players evenly across these sections, randomizing section placement if there are more sections than players in a given group. This process would be repeated for each group starting with the largest group. There are scenarios where players in smaller groups end up having only adjacent positions available when it comes to their distribution which necessitates a shuffling step for previously placed groups."),(0,r.kt)("h2",{id:"avoidance-policies"},"Avoidance Policies"),(0,r.kt)("p",null,"Both the ",(0,r.kt)("strong",{parentName:"p"},"tournamentEngine")," and ",(0,r.kt)("strong",{parentName:"p"},"drawEngine")," within the Competition Factory support attaching policy definitions which control the behavior of various exported methods."),(0,r.kt)("p",null,"For Avoidance the algoritm requires access to attributes of tournament participants and thus must be accessed via the ",(0,r.kt)("strong",{parentName:"p"},"tournamentEngine"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const values = {\n  event,\n  eventId,\n  automated: true,\n  drawSize: 32,\n  policyDefinitions: { ...AVOIDANCE_COUNTRY },\n};\nconst { drawDefinition } = tournamentEngine.generateDrawDefinition(values);\n")),(0,r.kt)("p",null,"In this case the ",(0,r.kt)("strong",{parentName:"p"},"policydefinition")," specifies that participants in the generated draw are to be separated according to any country values that may exist on participant records. The policy is defined as follows:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const AVOIDANCE_COUNTRY = {\n  avoidance: {\n    roundsToSeparate: undefined,\n    policyName: 'Nationality Code',\n    policyAttributes: [\n      { key: 'person.nationalityCode' },\n      { key: 'individualParticipants.person.nationalityCode' },\n    ],\n  },\n};\n")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"policyName")," is not required but useful for identifying a policy which has been attached to a ",(0,r.kt)("strong",{parentName:"p"},"drawDefinition")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"roundsToSeparate")," defines the desired separation; if undefined defaults to maximum separation.\n",(0,r.kt)("strong",{parentName:"p"},"targetDivisions")," can optionally be used to calculate ",(0,r.kt)("strong",{parentName:"p"},"roundsToSeparate")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"policyAttrributes")," is an array of ",(0,r.kt)("a",{parentName:"p",href:"./accessors"},'"accessors"')," which determine which attributes of participants to consider. In the example above the ",(0,r.kt)("em",{parentName:"p"},"nationalityCode")," of participants can be found in different places depending on whether the participant is an INDIVIDUAL or a PAIR. This notation works regardless of whether child attributes are strings, numbers, or arrays, as is the case with ",(0,r.kt)("em",{parentName:"p"},"individualPartcipants")," in PAIR participants."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"policyAttributes")," can have an additional attribute ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"significantCharacters"))," which specifies the number of characters which will be considered when creating values for each key."),(0,r.kt)("p",null,'INDIVIDUAL participants may be members of PAIR, TEAM and GROUP participants; the INDIVIDUAL participant object does not contain these attributes, so they must be added as "context" before avoidance processing can proceed. Three additional attributes are therefore added to the INDIVIDUAL partcipant objects:'),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"pairParticipantIds"),(0,r.kt)("li",{parentName:"ul"},"teamParticipantIds"),(0,r.kt)("li",{parentName:"ul"},"groupParticipantIds")),(0,r.kt)("p",null,"Specifying that PAIR, TEAM or GROUP participants should be considered for avoidance is achieved via 'directives' rather than keys because the value are handled differently."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const pairAvoidancePolicy = {\n  roundsToSeparate: undefined,\n  policyName: 'Doubles Partner Avoidance',\n  policyAttributes: [{ directive: 'pairParticipants' }],\n};\n")),(0,r.kt)("p",null,"To restrict the participantIds to be considered, add ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"includeIds"))," as an attribute containing an array of desired participantIds."),(0,r.kt)("p",null,"Other desired avoidance attributes may exist on participant objects as extensions. Any such extensions will be added as attributes to the participant object prior to processing."))}d.isMDXComponent=!0}}]);