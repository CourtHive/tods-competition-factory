(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[180],{3905:function(e,t,a){"use strict";a.d(t,{Zo:function(){return c},kt:function(){return h}});var n=a(7294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},c=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(a),h=i,m=u["".concat(s,".").concat(h)]||u[h]||d[h]||r;return a?n.createElement(m,o(o({ref:t},c),{},{components:a})):n.createElement(m,o({ref:t},c))}));function h(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=a.length,o=new Array(r);o[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var p=2;p<r;p++)o[p]=a[p];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},7825:function(e,t,a){"use strict";a.r(t),a.d(t,{frontMatter:function(){return o},metadata:function(){return l},toc:function(){return s},default:function(){return c}});var n=a(2122),i=a(9756),r=(a(7294),a(3905)),o={title:"Round Robin Tally Policy"},l={unversionedId:"policies/tallyPolicy",id:"policies/tallyPolicy",isDocsHomePage:!1,title:"Round Robin Tally Policy",description:"A tallyPolicy controls how order is determined for Round Robin groups.",source:"@site/docs/policies/tallyPolicy.md",sourceDirName:"policies",slug:"/policies/tallyPolicy",permalink:"/tods-competition-factory/docs/policies/tallyPolicy",version:"current",frontMatter:{title:"Round Robin Tally Policy"},sidebar:"docs",previous:{title:"Scheduling Policy",permalink:"/tods-competition-factory/docs/policies/scheduling"},next:{title:"Feed Policy",permalink:"/tods-competition-factory/docs/policies/feedPolicy"}},s=[{value:"Default Behavior",id:"default-behavior",children:[]},{value:"Implementation Details",id:"implementation-details",children:[]}],p={toc:s};function c(e){var t=e.components,a=(0,i.Z)(e,["components"]);return(0,r.kt)("wrapper",(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A ",(0,r.kt)("inlineCode",{parentName:"p"},"tallyPolicy")," controls how order is determined for Round Robin groups."),(0,r.kt)("p",null,"Policy Definitions can be attached to a ",(0,r.kt)("a",{parentName:"p",href:"../apis/tournament-engine-api#attachpolicy"},"tournament record"),", or an ",(0,r.kt)("a",{parentName:"p",href:"../apis/tournament-engine-api#attacheventpolicy"},"event"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const tallyPolicy = {\n  headToHead: {\n    disabled: false,\n  },\n  disqualifyDefaults: true, // disqualified participants are pushed to the bottom of the group order\n  disqualifyWalkovers: true, // disqualified participants are pushed to the bottom of the group order\n  setsCreditForDefaults: true, // whether or not to award e.g. 2 sets won for player who wins by opponent DEFAULT\n  setsCreditForWalkovers: true, // whether or not to award e.g. 2 sets won for player who wins by opponent WALKOVER\n  gamesCreditForDefaults: true, // whether or not to award e.g. 12 games won for player who wins by opponent DEFAULT\n  gamesCreditForWalkovers: true, // whether or not to award e.g. 12 games won for player who wins by opponent WALKOVER\n  tallyDirectives: [\n    // these are the default values if no tallyDirectives provided; edit to suit\n    // idsFilter scopes the tally calculations to only tied participants\n    // with { idsFilter: false } the ratio is calculated from all group matchUps\n    // with { idsFilter: true } the ratio is calculated from matchUps including tied participants\n    // any attribute/idsFilter combination can be selectively disabled for Head to Head calculations\n    { attribute: 'matchUpsRatio', idsFilter: false, disbleHeadToHead: false },\n    { attribute: 'setsRatio', idsFilter: false, disbleHeadToHead: false },\n    { attribute: 'gamesRatio', idsFilter: false, disbleHeadToHead: false },\n    { attribute: 'pointsRatio', idsFilter: false, disbleHeadToHead: false },\n    { attribute: 'matchUpsRatio', idsFilter: true, disbleHeadToHead: false },\n    { attribute: 'setsRatio', idsFilter: true, disbleHeadToHead: false },\n    { attribute: 'gamesRatio', idsFilter: true, disbleHeadToHead: false },\n    { attribute: 'pointsRatio', idsFilter: true, disbleHeadToHead: false },\n  ],\n};\n")),(0,r.kt)("h2",{id:"default-behavior"},"Default Behavior"),(0,r.kt)("p",null,"Round Robin group tally logic by default implements the following guidelines:"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"The player who wins the most matches is the winner."),(0,r.kt)("li",{parentName:"ol"},"If two players are tied, then the winner of their head-to-head match is the winner.")),(0,r.kt)("p",null,"If three or more players are tied, tie are broken as follows:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving just the tied players;"),(0,r.kt)("li",{parentName:"ul"},"The player with the highest percentage of sets won of all sets completed;"),(0,r.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,r.kt)("li",{parentName:"ul"},"The player with the highest percentage of games won of all games completed;"),(0,r.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,r.kt)("li",{parentName:"ul"},"The player with the highest percentage of sets won of sets completed among players in the group under consideration;"),(0,r.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied;"),(0,r.kt)("li",{parentName:"ul"},"The player with the highest percentage of games won of games completed among the players under consideration; and"),(0,r.kt)("li",{parentName:"ul"},"The head-to-head win-loss record in matches involving the players who remain tied.")),(0,r.kt)("h2",{id:"implementation-details"},"Implementation Details"),(0,r.kt)("p",null,"After initial separation of participants by ",(0,r.kt)("inlineCode",{parentName:"p"},"matchUpsWon"),",\nthe implementation is configurable by supplying an array of ",(0,r.kt)("inlineCode",{parentName:"p"},"tallyDirectives")," in the ",(0,r.kt)("inlineCode",{parentName:"p"},"tallyPolicy"),"."),(0,r.kt)("p",null,"The algorithm relies on the values availble in the calculated ",(0,r.kt)("inlineCode",{parentName:"p"},"participantResults")," and works as follows:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"separate particpants into groups by a given attribute"),(0,r.kt)("li",{parentName:"ul"},"a group with a single participant is 'resolved'"),(0,r.kt)("li",{parentName:"ul"},"groups of two participants are resolved by head-to-head (if not disabled/if participants faced each other)"),(0,r.kt)("li",{parentName:"ul"},"groups of three or more search for an attribute that will separate them into smaller groups"),(0,r.kt)("li",{parentName:"ul"},"participantResults scoped to the members of a group and recalculated when ",(0,r.kt)("inlineCode",{parentName:"li"},"{ idsFilter: true }"))))}c.isMDXComponent=!0}}]);