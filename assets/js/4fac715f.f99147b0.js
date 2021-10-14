(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[812],{3905:function(t,e,n){"use strict";n.d(e,{Zo:function(){return m},kt:function(){return u}});var r=n(7294);function a(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function p(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?i(Object(n),!0).forEach((function(e){a(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function o(t,e){if(null==t)return{};var n,r,a=function(t,e){if(null==t)return{};var n,r,a={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(a[n]=t[n]);return a}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a}var c=r.createContext({}),l=function(t){var e=r.useContext(c),n=e;return t&&(n="function"==typeof t?t(e):p(p({},e),t)),n},m=function(t){var e=l(t.components);return r.createElement(c.Provider,{value:e},t.children)},s={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},d=r.forwardRef((function(t,e){var n=t.components,a=t.mdxType,i=t.originalType,c=t.parentName,m=o(t,["components","mdxType","originalType","parentName"]),d=l(n),u=a,g=d["".concat(c,".").concat(u)]||d[u]||s[u]||i;return n?r.createElement(g,p(p({ref:e},m),{},{components:n})):r.createElement(g,p({ref:e},m))}));function u(t,e){var n=arguments,a=e&&e.mdxType;if("string"==typeof t||a){var i=n.length,p=new Array(i);p[0]=d;var o={};for(var c in e)hasOwnProperty.call(e,c)&&(o[c]=e[c]);o.originalType=t,o.mdxType="string"==typeof t?t:a,p[1]=o;for(var l=2;l<i;l++)p[l]=n[l];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},985:function(t,e,n){"use strict";n.r(e),n.d(e,{frontMatter:function(){return o},metadata:function(){return c},toc:function(){return l},default:function(){return s}});var r=n(2122),a=n(9756),i=(n(7294),n(3905)),p=["components"],o={title:"Overview"},c={unversionedId:"engines/draw-engine-overview",id:"engines/draw-engine-overview",isDocsHomePage:!1,title:"Overview",description:"The drawEngine_** generates drawDefinitions and matchUp results, managing participant movement within and between structures. Participants, however, are not necessary for the operations performed by the drawEngine_**, and reference to participantIds only occurs in two places:",source:"@site/docs/engines/draw-engine-overview.md",sourceDirName:"engines",slug:"/engines/draw-engine-overview",permalink:"/tods-competition-factory/docs/engines/draw-engine-overview",version:"current",frontMatter:{title:"Overview"},sidebar:"docs",previous:{title:"API",permalink:"/tods-competition-factory/docs/apis/tournament-engine-api"},next:{title:"API",permalink:"/tods-competition-factory/docs/apis/draw-engine-api"}},l=[{value:"Participant &quot;agnostic&quot;",id:"participant-agnostic",children:[]},{value:"Changing matchUpStatus",id:"changing-matchupstatus",children:[]},{value:"matchUpStatus effects",id:"matchupstatus-effects",children:[]},{value:"Single structure effects",id:"single-structure-effects",children:[]},{value:"Multi-structure effects",id:"multi-structure-effects",children:[]}],m={toc:l};function s(t){var e=t.components,n=(0,a.Z)(t,p);return(0,i.kt)("wrapper",(0,r.Z)({},m,n,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"The ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("em",{parentName:"strong"},"drawEngine"))," generates drawDefinitions and matchUp results, managing participant movement within and between structures. Participants, however, are not necessary for the operations performed by the ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("em",{parentName:"strong"},"drawEngine")),", and reference to ",(0,i.kt)("inlineCode",{parentName:"p"},"participantIds")," only occurs in two places:"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("inlineCode",{parentName:"li"},"drawDefinition.entries")),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("inlineCode",{parentName:"li"},"drawDefinition.structures[#].positionAssignments"))),(0,i.kt)("h2",{id:"participant-agnostic"},'Participant "agnostic"'),(0,i.kt)("p",null,"The ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("em",{parentName:"strong"},"drawEngine")),' is "participant agnostic", and doesn\'t know or care whether the participants moving through the ',(0,i.kt)("inlineCode",{parentName:"p"},"structures")," of a draw are ",(0,i.kt)("inlineCode",{parentName:"p"},"participantType")," INDIVIDUAL, PAIR or TEAM."),(0,i.kt)("p",null,"The logic governing participant movements between ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps")," within ",(0,i.kt)("inlineCode",{parentName:"p"},"structures")," requires only ",(0,i.kt)("inlineCode",{parentName:"p"},"drawPositions"),"; ",(0,i.kt)("inlineCode",{parentName:"p"},"positionAssignments")," are used when requesting ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps"),' with "context" to add ',(0,i.kt)("inlineCode",{parentName:"p"},"sides")," which include ",(0,i.kt)("inlineCode",{parentName:"p"},"participants"),"."),(0,i.kt)("h2",{id:"changing-matchupstatus"},"Changing matchUpStatus"),(0,i.kt)("p",null,"Changing the ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUpStatus")," of a ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUp")," may affect other ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps")," across the structures that make up a draw."),(0,i.kt)("p",null,"Any attempt to change from a ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("em",{parentName:"strong"},"directing"))," to a ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("em",{parentName:"strong"},"non-directing"))," ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUpStatus"),", or vice-versa, causes the ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("em",{parentName:"strong"},"drawEngine"))," to check the validity of the change and, if valid, to modify all affected ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps"),"."),(0,i.kt)("h2",{id:"matchupstatus-effects"},"matchUpStatus effects"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"th"},"matchUpStatus")),(0,i.kt)("th",{parentName:"tr",align:"center"},"Completed"),(0,i.kt)("th",{parentName:"tr",align:"center"},"Directing"),(0,i.kt)("th",{parentName:"tr",align:"center"},"Active"),(0,i.kt)("th",{parentName:"tr",align:"center"},"Upcoming"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"BYE"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"RETIRED"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"DEFAULTED"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"COMPLETED"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"WALKOVER"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"DOUBLE_WALKOVER"),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"},"-"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"INCOMPLETE"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"IN_PROGRESS"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"SUSPENDED"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"},"x"),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"TO_BE_PLAYED"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"},"x")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"NOT_PLAYED"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"},"x")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"CANCELLED"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"ABANDONED"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"DEAD_RUBBER"),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"}),(0,i.kt)("td",{parentName:"tr",align:"center"})))),(0,i.kt)("h2",{id:"single-structure-effects"},"Single structure effects"),(0,i.kt)("p",null,"If the effects of a change to a ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUpStatus")," are limited to a single structure, the only changes necessary are that ",(0,i.kt)("inlineCode",{parentName:"p"},"drawPositions")," of relevant ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUps")," be modified to reflect participant movements across rounds."),(0,i.kt)("h2",{id:"multi-structure-effects"},"Multi-structure effects"),(0,i.kt)("p",null,"When there are multiple structures in a draw, such as COMPASS or DOUBLE ELIMINATION draws, then losers (and sometimes winners) can move across structures. For instance a first round loser in an EAST structure will move into the first round of the WEST structure. When this happens the ",(0,i.kt)("inlineCode",{parentName:"p"},"positionAssignments")," for the target structure must be updated to map the ",(0,i.kt)("inlineCode",{parentName:"p"},"participantId")," to the ",(0,i.kt)("inlineCode",{parentName:"p"},"drawPosition")," where they have been assigned."))}s.isMDXComponent=!0}}]);