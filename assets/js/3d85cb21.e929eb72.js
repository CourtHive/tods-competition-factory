"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[6604],{7942:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var r=n(959);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),u=p(n),m=a,f=u["".concat(l,".").concat(m)]||u[m]||d[m]||o;return n?r.createElement(f,i(i({ref:t},c),{},{components:n})):r.createElement(f,i({ref:t},c))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},615:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>d,frontMatter:()=>o,metadata:()=>s,toc:()=>p});var r=n(8957),a=(n(959),n(7942));const o={title:"Draw Types"},i=void 0,s={unversionedId:"concepts/draw-types",id:"concepts/draw-types",title:"Draw Types",description:"Draw Types",source:"@site/docs/concepts/draw-types.md",sourceDirName:"concepts",slug:"/concepts/draw-types",permalink:"/tods-competition-factory/docs/concepts/draw-types",draft:!1,tags:[],version:"current",frontMatter:{title:"Draw Types"},sidebar:"docs",previous:{title:"Draw Generation",permalink:"/tods-competition-factory/docs/concepts/draws-overview"},next:{title:"Actions",permalink:"/tods-competition-factory/docs/concepts/actions"}},l={},p=[{value:"Draw Types",id:"draw-types",level:2}],c={toc:p},u="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h2",{id:"draw-types"},"Draw Types"),(0,a.kt)("p",null,"The convenience method ",(0,a.kt)("inlineCode",{parentName:"p"},"engine.generateDrawDefinition()")," generates the following draw types:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"AD_HOC")," - An arbitrary number of matchUps may be added to an arbitrary number of rounds."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"COMPASS")," - Includes up to 8 structures; ensures participants a minimum of 3 matchUps."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"CURTIS")," - Includes 2 consolation structures, each fed by 2 main structure rounds, and a 3-4 playoff."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"DOUBLE_ELIMINATION")," - Main structure losers feed into consolation; consolation winner plays main structure winner."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP_TO_QF")," - Main structure losers feed into consolation through the Quarterfinals."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP_TO_R16")," - Main structure losers feed into consolation through the Round of 16."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP_TO_SF")," - Main structure losers feed into consolation through the Semifinals."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP")," - Main structure losers in every round feed into consolation."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"FEED_IN"),' - Also known as "staggered entry", participants feed into the main structure at specified rounds.'),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"FIRST_MATCH_LOSER_CONSOLATION")," - Losers feed into consolation whenever their first loss occurs."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"FIRST_ROUND_LOSER_CONSOLATION")," - Only first round losers feed into consolation structure."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"MODIFIED_FEED_IN_CHAMPIONSHIP")," - First and Second round losers are fed into consolation structure."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"OLYMPIC")," - Includes up to 4 structures; ensures participants a minimum of 2 matchUps."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"PLAY_OFF")," - All positions are played off; structures are added to ensure unique finishing positions."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"ROUND_ROBIN")," - Participants divided into specified group sizes."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"ROUND_ROBIN_WITH_PLAYOFF")," - Includes automated generation of specified playoff structures."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"SINGLE_ELIMINATION")," - Standard knockout draw structure.")),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("strong",{parentName:"p"},"Additional Playoff Structures"),"\n",(0,a.kt)("inlineCode",{parentName:"p"},"getAvailablePlayoffProfiles()")," provides valid attributes for playoff structures generation.\n",(0,a.kt)("inlineCode",{parentName:"p"},"generateAndPopulatePlayoffStructures()")," generates playoff structures.\n",(0,a.kt)("inlineCode",{parentName:"p"},"attachPlayoffStructures()")," attaches playoff structures to target drawDefinition.\n",(0,a.kt)("inlineCode",{parentName:"p"},"addPlayoffStructures()")," combines generation and attachment of playoff structures."),(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("strong",{parentName:"p"},"Voluntary Consolation Structure"),"\n",(0,a.kt)("inlineCode",{parentName:"p"},"getEligibleVoluntaryConsolationParticipants()")," configurable method for determining eligibility.\n",(0,a.kt)("inlineCode",{parentName:"p"},"generateVoluntaryConsolation()")," generates matchUps for consolation structure.")))}d.isMDXComponent=!0}}]);