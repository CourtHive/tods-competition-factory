(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{"/KMQ":function(e,t,a){"use strict";a.r(t),a.d(t,"_frontmatter",(function(){return s})),a.d(t,"default",(function(){return d}));var n=a("Fcif"),i=a("+I+c"),r=(a("mXGw"),a("/FXl")),o=a("TjRS"),s=(a("aD51"),{});void 0!==s&&s&&s===Object(s)&&Object.isExtensible(s)&&!s.hasOwnProperty("__filemeta")&&Object.defineProperty(s,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/drawEngine/documentation/avoidance.md"}});var c={_frontmatter:s},p=o.a;function d(e){var t=e.components,a=Object(i.a)(e,["components"]);return Object(r.b)(p,Object(n.a)({},c,a,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h1",{id:"avoidance"},"Avoidance"),Object(r.b)("p",null,"Avoidance is an attempt to insure that grouped players do not encounter each other in early rounds (or just the first round) of an elimination draw structure, or that round robin brackets are generated such that players from the same group are evenly distributed across brackets and do not encounter each other unless there are more group members than there are brackets."),Object(r.b)("p",null,"Avoidance can be applied to ",Object(r.b)("a",Object(n.a)({parentName:"p"},{href:"/tods-competition-factory/drawEngine/seedPositiioning#seed-blocks"}),"Seed Blocks")," as well as unseeded players, though Seeded players may only be moved to other positions valid for the Seed Block within which they are placed."),Object(r.b)("h2",{id:"single-round-avoidance"},"Single Round Avoidance"),Object(r.b)("p",null,"Single Round Avoidance an be accomplished by random placement followed by an iterative shuffling algorithm which generates a score for each player distribution and which runs through a set number of iterations, or by iterative attempts to resolve conflicts by searching for alternate player positions. In some cases where single round avoidance is the goal it is specifically forbidden to attempt to maximize player separation within a draw."),Object(r.b)("h2",{id:"multiple-round-avoidance"},"Multiple Round Avoidance"),Object(r.b)("p",null,"Multiple Round Avoidance seeks to place players as far apart within a draw structure as possible. This can be accomplished by dividing a draw structure into sections based on the number of players within a given group and distributing a group's players evenly across these sections, randomizing section placement if there are more sections than players in a given group. This process would be repeated for each group starting with the largest group. There are scenarios where players in smaller groups end up having only adjacent positions available when it comes to their distribution which necessitates a shuffling step for previously placed groups."),Object(r.b)("h2",{id:"avoidance-policies"},"Avoidance Policies"),Object(r.b)("p",null,"Both the ",Object(r.b)("strong",{parentName:"p"},"tournamentEngine")," and ",Object(r.b)("strong",{parentName:"p"},"drawEngine")," within the Competition Factory support attaching policy definitions which control the behavior of various exported methods."),Object(r.b)("p",null,"For Avoidance the algoritm requires access to attributes of tournament participants and thus must be accessed via the ",Object(r.b)("strong",{parentName:"p"},"tournamentEngine"),"."),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"const values = {\n  event,\n  eventId,\n  automated: true,\n  drawSize: 32,\n  policyDefinitions: [AVOIDANCE_COUNTRY],\n};\nconst { drawDefinition } = tournamentEngine.generateDrawDefinition(values);\n")),Object(r.b)("p",null,"In this case the ",Object(r.b)("strong",{parentName:"p"},"policydefinition")," specifies that participants in the generated draw are to be separated according to any country values that may exist on participant records. The policy is defined as follows:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"const AVOIDANCE_COUNTRY = {\n  avoidance: {\n    roundsToSeparate: undefined,\n    policyName: 'Nationality Code',\n    policyAttributes: [\n      { key: 'person.nationalityCode' },\n      { key: 'individualParticipants.person.nationalityCode' },\n    ],\n  },\n};\n")),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"policyName")," is not required but useful for identifying a policy which has been attached to a ",Object(r.b)("strong",{parentName:"p"},"drawDefinition")),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"roundsToSeparate")," defines the desired separation; if undefined defaults to maximum separation."),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"policyAttrributes"),' is an array of "accessors" which determine which attributes of participants to consider. In the example above the ',Object(r.b)("em",{parentName:"p"},"nationalityCode")," of participants can be found in different places depending on whether the participant is an INDIVIDUAL or a PAIR. This notation works regardless of whether child attributes are strings, numbers, or arrays, as is the case with ",Object(r.b)("em",{parentName:"p"},"individualPartcipants")," in PAIR participants."),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"policyAttributes")," can have an additional attribute ",Object(r.b)("strong",{parentName:"p"},Object(r.b)("em",{parentName:"strong"},"significantCharacters"))," which specifies the number of characters which will be considered when creating values for each key."),Object(r.b)("p",null,'INDIVIDUAL participants may be mebmers of PAIR, TEAM and GROUP participants; the INDIVIDUAL participant object does not contain these attributes, so they must be added as "context" before avoidance processing can proceed. Three additional attributes are therefore added to the INDIVIDUAL partcipant objects:'),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"pairParticipantIds"),Object(r.b)("li",{parentName:"ul"},"teamParticipantIds"),Object(r.b)("li",{parentName:"ul"},"groupParticipantIds")),Object(r.b)("p",null,"Specifying that PAIR, TEAM or GROUP particpants should be considered for avoidance is achieved via 'directives' rather than keys because the value are handled differently."),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"const pairAvoidancePolicy = {\n  roundsToSeparate: undefined,\n  policyName: 'Doubles Partner Avoidance',\n  policyAttributes: [{ directive: 'pairParticipants' }],\n};\n")),Object(r.b)("p",null,"To restrict the participantIds to be considered, add ",Object(r.b)("strong",{parentName:"p"},Object(r.b)("em",{parentName:"strong"},"includeIds"))," as an attribute containing an array of desired participantIds."),Object(r.b)("p",null,"Other desired avoidance attributes may exist on participant objects as extensions. Any such extensions will be added as attributes to the particpant object prior to processing."))}void 0!==d&&d&&d===Object(d)&&Object.isExtensible(d)&&!d.hasOwnProperty("__filemeta")&&Object.defineProperty(d,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/drawEngine/documentation/avoidance.md"}}),d.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-draw-engine-documentation-avoidance-md-e795f70e62c556dbd5f0.js.map