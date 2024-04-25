"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[5788],{6034:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>g});var r=t(1258);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var d=r.createContext({}),s=function(e){var n=r.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},c=function(e){var n=s(e.components);return r.createElement(d.Provider,{value:n},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),p=s(t),u=a,g=p["".concat(d,".").concat(u)]||p[u]||m[u]||i;return t?r.createElement(g,o(o({ref:n},c),{},{components:t})):r.createElement(g,o({ref:n},c))}));function g(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=u;var l={};for(var d in n)hasOwnProperty.call(n,d)&&(l[d]=n[d]);l.originalType=e,l[p]="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=t[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},9220:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var r=t(8957),a=(t(1258),t(6034));const i={title:"Engine Middleware"},o=void 0,l={unversionedId:"engines/engine-middleware",id:"engines/engine-middleware",title:"Engine Middleware",description:"Before each factory function invocation, parameters are passed through engine middleware which resolves event and drawDefinition from provided identifiers.",source:"@site/docs/engines/engine-middleware.md",sourceDirName:"engines",slug:"/engines/engine-middleware",permalink:"/tods-competition-factory/docs/engines/engine-middleware",draft:!1,tags:[],version:"current",frontMatter:{title:"Engine Middleware"},sidebar:"docs",previous:{title:"Engine Logging",permalink:"/tods-competition-factory/docs/engines/engine-logging"},next:{title:"Mutation Engines",permalink:"/tods-competition-factory/docs/engines/mutation-engines"}},d={},s=[{value:"Tournament",id:"tournament",level:2},{value:"Disable middleware",id:"disable-middleware",level:2}],c={toc:s},p="wrapper";function m(e){let{components:n,...t}=e;return(0,a.kt)(p,(0,r.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Before each factory function invocation, parameters are passed through engine middleware which resolves ",(0,a.kt)("inlineCode",{parentName:"p"},"event")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"drawDefinition")," from provided identifiers."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.getEvent({ drawId }); // derivation of event is handled by middleware\n")),(0,a.kt)("h2",{id:"tournament"},"Tournament"),(0,a.kt)("p",null,"Since the engine shared state can hold multiple ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentRecords"),", passing ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentId")," as a parameter ensures that functions are performed on the correct tournament."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"const { participants } = askEngine.getParticipants({ tournamentId });\n")),(0,a.kt)("p",null,"Passing ",(0,a.kt)("inlineCode",{parentName:"p"},"tournamentId")," is unnecessary when there is only one tournament in state, or when ",(0,a.kt)("inlineCode",{parentName:"p"},"setTournamentId(tournamentId)")," has been called."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"import { askEngine, globalStat } from 'tods-competition-factory';\n\nglobalState.setTournamentId(tournamentId);\n\n// - or -\naskEngine.setTourmamentId(touramentId);\n")),(0,a.kt)("h2",{id:"disable-middleware"},"Disable middleware"),(0,a.kt)("p",null,"To disable middleware, pass the parameter ",(0,a.kt)("inlineCode",{parentName:"p"},"_middleware: false"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.getEvent({ drawId, _middleware: false }); // function invocation will fail\n")))}m.isMDXComponent=!0}}]);