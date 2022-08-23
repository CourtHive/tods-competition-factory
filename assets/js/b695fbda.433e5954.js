"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7066],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>h});var i=a(7294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,i)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,i,n=function(e,t){if(null==e)return{};var a,i,n={},r=Object.keys(e);for(i=0;i<r.length;i++)a=r[i],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)a=r[i],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=i.createContext({}),p=function(e){var t=i.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},c=function(e){var t=p(e.components);return i.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var a=e.components,n=e.mdxType,r=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(a),h=n,m=u["".concat(s,".").concat(h)]||u[h]||d[h]||r;return a?i.createElement(m,o(o({ref:t},c),{},{components:a})):i.createElement(m,o({ref:t},c))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=a.length,o=new Array(r);o[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:n,o[1]=l;for(var p=2;p<r;p++)o[p]=a[p];return i.createElement.apply(null,o)}return i.createElement.apply(null,a)}u.displayName="MDXCreateElement"},805:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>d,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var i=a(7462),n=(a(7294),a(3905));const r={title:"Round Robin Tally Policy"},o=void 0,l={unversionedId:"policies/tally-policy",id:"policies/tally-policy",title:"Round Robin Tally Policy",description:"A Tally Policy controls how order is determined for Round Robin groups.",source:"@site/docs/policies/tally-policy.md",sourceDirName:"policies",slug:"/policies/tally-policy",permalink:"/tods-competition-factory/docs/policies/tally-policy",draft:!1,tags:[],version:"current",frontMatter:{title:"Round Robin Tally Policy"},sidebar:"docs",previous:{title:"Ranking Policy",permalink:"/tods-competition-factory/docs/policies/ranking-policy"},next:{title:"Feed Policy",permalink:"/tods-competition-factory/docs/policies/feedPolicy"}},s={},p=[{value:"Default Behavior",id:"default-behavior",level:2},{value:"Implementation Details",id:"implementation-details",level:2}],c={toc:p};function d(e){let{components:t,...a}=e;return(0,n.kt)("wrapper",(0,i.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"A ",(0,n.kt)("strong",{parentName:"p"},"Tally Policy")," controls how order is determined for Round Robin groups."),(0,n.kt)("p",null,"Policy Definitions can be attached to a ",(0,n.kt)("a",{parentName:"p",href:"../apis/tournament-engine-api#attachpolicies"},"tournament record"),", or an ",(0,n.kt)("a",{parentName:"p",href:"../apis/tournament-engine-api#attacheventpolicies"},"event"),"."),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-js"},"const roundRobinTally = {\n  groupOrderKey: 'matchUpsWon', // possible to group by matchUpsWon, setsWon, gamesWon, or pointsWon\n  headToHead: {\n    disabled: false,\n    tallyDirectives: [\n      // these are the default values if no tallyDirectives provided; edit to suit\n      // idsFilter scopes the tally calculations to only tied participants\n      // with { idsFilter: false } the ratio is calculated from all group matchUps\n      // with { idsFilter: true } the ratio is calculated from matchUps including tied participants\n      // any attribute/idsFilter combination can be selectively disabled for Head to Head calculations\n      { attribute: 'matchUpsPct', idsFilter: false, disbleHeadToHead: false },\n      {\n        attribute: 'tieMatchUpsPct',\n        idsFilter: false,\n        disbleHeadToHead: false,\n      },\n      { attribute: 'setsPct', idsFilter: false, disbleHeadToHead: false },\n      { attribute: 'gamesPct', idsFilter: false, disbleHeadToHead: false },\n      { attribute: 'pointsRatio', idsFilter: false, disbleHeadToHead: false },\n      { attribute: 'matchUpsPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'tieMatchUpsPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'setsPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'gamesPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'pointsRatio', idsFilter: true, disbleHeadToHead: false },\n    ],\n  },\n  disqualifyDefaults: true, // disqualified participants are pushed to the bottom of the group order\n  disqualifyWalkovers: true, // disqualified participants are pushed to the bottom of the group order\n  setsCreditForDefaults: true, // whether or not to award e.g. 2 sets won for participant who wins by opponent DEFAULT\n  setsCreditForWalkovers: true, // whether or not to award e.g. 2 sets won for participant who wins by opponent WALKOVER\n  gamesCreditForDefaults: true, // whether or not to award e.g. 12 games won for participant who wins by opponent DEFAULT\n  gamesCreditForWalkovers: true, // whether or not to award e.g. 12 games won for participant who wins by opponent WALKOVER\n  GEMscore: [\n    'matchUpsPct',\n    'tieMatchUpsPct',\n    'setsPct',\n    'gamesPct',\n    'pointsRatio',\n  ],\n};\n\ntournamentEngine.attachPolicies({ policyDefinitions: { roundRobinTally } });\n")),(0,n.kt)("h2",{id:"default-behavior"},"Default Behavior"),(0,n.kt)("p",null,"Round Robin group tally logic by default implements the following guidelines:"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"The participant who wins the most matches is the winner."),(0,n.kt)("li",{parentName:"ol"},"If two players are tied, then the winner of their head-to-head match is the winner.")),(0,n.kt)("p",null,"If three or more participants are tied, tie are broken as follows:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving just the tied players;"),(0,n.kt)("li",{parentName:"ul"},"The participant with the highest percentage of sets won of all sets completed;"),(0,n.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,n.kt)("li",{parentName:"ul"},"The participant with the highest percentage of games won of all games completed;"),(0,n.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,n.kt)("li",{parentName:"ul"},"The participant with the highest percentage of sets won of sets completed among players in the group under consideration;"),(0,n.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,n.kt)("li",{parentName:"ul"},"The participant with the highest percentage of games won of games completed among the players under consideration; and"),(0,n.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied.")),(0,n.kt)("h2",{id:"implementation-details"},"Implementation Details"),(0,n.kt)("p",null,"After initial separation of participants by ",(0,n.kt)("inlineCode",{parentName:"p"},"matchUpsWon"),",\nthe implementation is configurable by supplying an array of ",(0,n.kt)("inlineCode",{parentName:"p"},"tallyDirectives")," in the ",(0,n.kt)("strong",{parentName:"p"},"Tally Policy"),"."),(0,n.kt)("p",null,"The algorithm relies on the values availble in the calculated ",(0,n.kt)("inlineCode",{parentName:"p"},"participantResults")," and works as follows:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"separate participants into groups by a given attribute"),(0,n.kt)("li",{parentName:"ul"},"a group with a single participant is 'resolved'"),(0,n.kt)("li",{parentName:"ul"},"groups of two participants are resolved by head-to-head (if not disabled/if participants faced each other)"),(0,n.kt)("li",{parentName:"ul"},"groups of three or more search for an attribute that will separate them into smaller groups"),(0,n.kt)("li",{parentName:"ul"},"participantResults scoped to the members of a group and recalculated when ",(0,n.kt)("inlineCode",{parentName:"li"},"{ idsFilter: true }"))))}d.isMDXComponent=!0}}]);