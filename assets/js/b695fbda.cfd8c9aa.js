"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7066],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>h});var n=a(7294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function r(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):r(r({},t),e)),a},c=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(a),h=i,m=u["".concat(s,".").concat(h)]||u[h]||d[h]||o;return a?n.createElement(m,r(r({ref:t},c),{},{components:a})):n.createElement(m,r({ref:t},c))}));function h(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=a.length,r=new Array(o);r[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,r[1]=l;for(var p=2;p<o;p++)r[p]=a[p];return n.createElement.apply(null,r)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},805:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>r,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var n=a(7462),i=(a(7294),a(3905));const o={title:"Round Robin Tally Policy"},r=void 0,l={unversionedId:"policies/tally-policy",id:"policies/tally-policy",title:"Round Robin Tally Policy",description:"A Tally Policy controls how order is determined for Round Robin groups.",source:"@site/docs/policies/tally-policy.md",sourceDirName:"policies",slug:"/policies/tally-policy",permalink:"/tods-competition-factory/docs/policies/tally-policy",draft:!1,tags:[],version:"current",frontMatter:{title:"Round Robin Tally Policy"},sidebar:"docs",previous:{title:"Ranking Policy",permalink:"/tods-competition-factory/docs/policies/ranking-policy"},next:{title:"Feed Policy",permalink:"/tods-competition-factory/docs/policies/feedPolicy"}},s={},p=[{value:"Default Behavior",id:"default-behavior",level:2},{value:"Implementation Details",id:"implementation-details",level:2}],c={toc:p};function d(e){let{components:t,...a}=e;return(0,i.kt)("wrapper",(0,n.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A ",(0,i.kt)("strong",{parentName:"p"},"Tally Policy")," controls how order is determined for Round Robin groups."),(0,i.kt)("p",null,"Policy Definitions can be attached to a ",(0,i.kt)("a",{parentName:"p",href:"../apis/tournament-engine-api#attachpolicies"},"tournament record"),", or an ",(0,i.kt)("a",{parentName:"p",href:"../apis/tournament-engine-api#attacheventpolicies"},"event"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const roundRobinTally = {\n  groupOrderKey: 'matchUpsWon', // possible to group by matchUpsWon, setsWon, gamesWon, or pointsWon\n  groupTotalSetsPlayed: false, // optional - when true will calculate % of sets won based on total group sets played rather than participant sets played\n  headToHead: {\n    disabled: false,\n    tallyDirectives: [\n      // these are the default values if no tallyDirectives provided; edit to suit\n      // idsFilter scopes the tally calculations to only tied participants\n      // with { idsFilter: false } the ratio is calculated from all group matchUps\n      // with { idsFilter: true } the ratio is calculated from matchUps including tied participants\n      // any attribute/idsFilter combination can be selectively disabled for Head to Head calculations\n      { attribute: 'matchUpsPct', idsFilter: false, disbleHeadToHead: false },\n      {\n        attribute: 'tieMatchUpsPct',\n        idsFilter: false,\n        disbleHeadToHead: false,\n      },\n      { attribute: 'setsPct', idsFilter: false, disbleHeadToHead: false },\n      { attribute: 'gamesPct', idsFilter: false, disbleHeadToHead: false },\n      { attribute: 'pointsRatio', idsFilter: false, disbleHeadToHead: false },\n      { attribute: 'matchUpsPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'tieMatchUpsPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'setsPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'gamesPct', idsFilter: true, disbleHeadToHead: false },\n      { attribute: 'pointsRatio', idsFilter: true, disbleHeadToHead: false },\n    ],\n  },\n  disqualifyDefaults: true, // disqualified participants are pushed to the bottom of the group order\n  disqualifyWalkovers: true, // disqualified participants are pushed to the bottom of the group order\n  setsCreditForDefaults: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent DEFAULT\n  setsCreditForWalkovers: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent WALKOVER\n  setsCreditForRetirements: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent RETIREMENT\n  gamesCreditForDefaults: false, // whether or not to award e.g. 12 games won for participant who wins by opponent DEFAULT\n  gamesCreditForWalkovers: false, // whether or not to award e.g. 12 games won for participant who wins by opponent WALKOVER\n  gamesCreditForRetirements: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent RETIREMENT\n  GEMscore: [\n    'matchUpsPct',\n    'tieMatchUpsPct',\n    'setsPct',\n    'gamesPct',\n    'pointsRatio',\n  ],\n};\n\ntournamentEngine.attachPolicies({ policyDefinitions: { roundRobinTally } });\n")),(0,i.kt)("h2",{id:"default-behavior"},"Default Behavior"),(0,i.kt)("p",null,"Round Robin group tally logic by default implements the following guidelines:"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"The participant who wins the most matches is the winner."),(0,i.kt)("li",{parentName:"ol"},"If two players are tied, then the winner of their head-to-head match is the winner.")),(0,i.kt)("p",null,"If three or more participants are tied, tie are broken as follows:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving just the tied players;"),(0,i.kt)("li",{parentName:"ul"},"The participant with the highest percentage of sets won of all sets completed;"),(0,i.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,i.kt)("li",{parentName:"ul"},"The participant with the highest percentage of games won of all games completed;"),(0,i.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,i.kt)("li",{parentName:"ul"},"The participant with the highest percentage of sets won of sets completed among players in the group under consideration;"),(0,i.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,i.kt)("li",{parentName:"ul"},"The participant with the highest percentage of games won of games completed among the players under consideration; and"),(0,i.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied.")),(0,i.kt)("h2",{id:"implementation-details"},"Implementation Details"),(0,i.kt)("p",null,"After initial separation of participants by ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUpsWon"),",\nthe implementation is configurable by supplying an array of ",(0,i.kt)("inlineCode",{parentName:"p"},"tallyDirectives")," in the ",(0,i.kt)("strong",{parentName:"p"},"Tally Policy"),"."),(0,i.kt)("p",null,"The algorithm relies on the values availble in the calculated ",(0,i.kt)("inlineCode",{parentName:"p"},"participantResults")," and works as follows:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"separate participants into groups by a given attribute"),(0,i.kt)("li",{parentName:"ul"},"a group with a single participant is 'resolved'"),(0,i.kt)("li",{parentName:"ul"},"groups of two participants are resolved by head-to-head (if not disabled/if participants faced each other)"),(0,i.kt)("li",{parentName:"ul"},"groups of three or more search for an attribute that will separate them into smaller groups"),(0,i.kt)("li",{parentName:"ul"},"participantResults scoped to the members of a group and recalculated when ",(0,i.kt)("inlineCode",{parentName:"li"},"{ idsFilter: true }"))))}d.isMDXComponent=!0}}]);