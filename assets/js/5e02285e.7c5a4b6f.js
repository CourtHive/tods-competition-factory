"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4173],{9276:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>v});var r=t(5271);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var s=r.createContext({}),u=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},c=function(e){var n=u(e.components);return r.createElement(s.Provider,{value:n},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),p=u(t),d=o,v=p["".concat(s,".").concat(d)]||p[d]||m[d]||a;return t?r.createElement(v,i(i({ref:n},c),{},{components:t})):r.createElement(v,i({ref:n},c))}));function v(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=t.length,i=new Array(a);i[0]=d;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[p]="string"==typeof e?e:o,i[1]=l;for(var u=2;u<a;u++)i[u]=t[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},3202:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>i,default:()=>m,frontMatter:()=>a,metadata:()=>l,toc:()=>u});var r=t(8957),o=(t(5271),t(9276));const a={title:"Competition Governor"},i=void 0,l={unversionedId:"governors/competition-governor",id:"governors/competition-governor",title:"Competition Governor",description:"Functions which are applicable to situations where multiple tournamentRecords are held in shared state.",source:"@site/docs/governors/competition-governor.md",sourceDirName:"governors",slug:"/governors/competition-governor",permalink:"/tods-competition-factory/docs/governors/competition-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"Competition Governor"},sidebar:"docs",previous:{title:"Governors",permalink:"/tods-competition-factory/docs/governors/governors-overview"},next:{title:"Draws Governor",permalink:"/tods-competition-factory/docs/governors/draws-governor"}},s={},u=[{value:"linkTournaments",id:"linktournaments",level:2},{value:"unlinkTournament",id:"unlinktournament",level:2},{value:"unlinkTournaments",id:"unlinktournaments",level:2},{value:"removeExtension",id:"removeextension",level:2}],c={toc:u},p="wrapper";function m(e){let{components:n,...t}=e;return(0,o.kt)(p,(0,r.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Functions which are applicable to situations where multiple ",(0,o.kt)("inlineCode",{parentName:"p"},"tournamentRecords")," are held in shared state."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { competitionGovernor } from 'tods-competition-factory';\n")),(0,o.kt)("h2",{id:"linktournaments"},"linkTournaments"),(0,o.kt)("p",null,"Links all tournaments currently loaded in state."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"engine.linkTournaments();\n")),(0,o.kt)("hr",null),(0,o.kt)("h2",{id:"unlinktournament"},"unlinkTournament"),(0,o.kt)("p",null,"Unlink the tournament specified by ",(0,o.kt)("inlineCode",{parentName:"p"},"tournamentId")," from other tournaments loaded in state."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"engine.unlinkTournament({ tournamentId });\n")),(0,o.kt)("hr",null),(0,o.kt)("h2",{id:"unlinktournaments"},"unlinkTournaments"),(0,o.kt)("p",null,"Removes links between all tournaments currently loaded in state."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"engine.unlinkTournaments();\n")),(0,o.kt)("h2",{id:"removeextension"},"removeExtension"),(0,o.kt)("p",null,"Removes an extension from all ",(0,o.kt)("inlineCode",{parentName:"p"},"tournamentRecords")," loaded into shared state."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"engine.removeExtension({ name, discover: true });\n")),(0,o.kt)("hr",null))}m.isMDXComponent=!0}}]);