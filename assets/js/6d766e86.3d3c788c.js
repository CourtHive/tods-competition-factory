"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7804],{7675:(e,t,a)=>{a.d(t,{Z:()=>T});var r=a(75),n=a(4034),o=a(2433),i=a(2380),m=a(804),s=a(3589),c=a(5051),l=a(9366),d=a(959);const p=e=>{const t=[e];return e>1&&t.unshift(e-1),t},u=(e,t,a)=>({setTo:t.setTo,noTiebreak:!e.target.checked,tiebreakAt:e.target.checked&&(t.tiebreakAt||t.setTo),[t.tiebreakSet?"tiebreakSet":"tiebreakFormat"]:{tiebreakTo:e.target.checked&&(a||7)}}),k=e=>{let{matchUpFormatParsed:t,hasFinalSet:a,isFinalSet:r,disabled:n,onChange:o}=e;const k=r?t?.finalSetFormat:t?.setFormat,f=k?.tiebreakSet,h=k?.tiebreakFormat?.tiebreakTo||k?.tiebreakSet?.tiebreakTo,b=t?.setFormat&&t?.setFormat?.noTiebreak,S=t?.finalSetFormat&&t?.finalSetFormat?.noTiebreak,y=t?.timed||k?.timed,g={exact:1===t?.bestOf?"exact":"bestof",what:(f?"TB":k?.setTo&&"S")||y&&"T"||"S"},[T,F]=(0,d.useState)(g),v=["S","TB"].indexOf(T.what)>=0&&[1,3,5].map((e=>({key:e,name:e})))||[1,3,5].map((e=>({key:e,name:e}))),E="T"===T.what?[10,15,20,25,30,45,60,90].map((e=>({name:`${e} Minutes`,key:e}))):"TB"===T.what?[5,7,9,10,11,12,15,21].map((e=>({name:`to ${e}`,key:e}))):[1,2,3,4,5,6,7,8,9].map((e=>({name:`to ${e}`,key:e}))),w=[{key:"final",name:"Final Set"}],B=1===t?.bestOf?[{key:"exact",name:"Exactly"}]:[{key:"bestof",name:"Best Of"},{key:"exact",name:"Exactly"}],U=e=>(n||[]).indexOf(e)>=0,Z=[{key:"S",name:"Set"},{key:"TB",name:"Tiebreak"},{disabled:U("timed")||r,name:"Timed Set",key:"T"}],N=[{key:"S",name:"Sets"},{key:"TB",name:"Tiebreaks"},{key:"T",name:"Timed Sets",disabled:U("timed")||r}],C=!t?.bestOf||1===t?.bestOf||r?Z:N,O=[{key:!1,name:"Ad"},{key:!0,name:"No Ad"}],A=[1,2].map((e=>({key:e,name:`Win by ${e}`}))),x=t?.bestOf||v[0].key,j=[5,7,9,10,12].map((e=>({name:`TB to: ${e}`,key:e}))),I=p(k?.setTo).map((e=>({name:`@ ${e}`,key:e}))),D=k?.NoAD,M=!!k?.tiebreakFormat?.NoAD||!!k?.tiebreakSet?.NoAD,P=e=>{F({...T,exact:e.target.value})},L=e=>{o({...t,bestOf:e.target.value||1})},$=e=>{o({...t,[r?"finalSetFormat":"setFormat"]:{...k,NoAD:e.target.value}})},W=e=>{o({...t,[r?"finalSetFormat":"setFormat"]:{...k,[k?.tiebreakFormat?"tiebreakFormat":"tiebreakSet"]:{...k?.tiebreakFormat?k?.tiebreakFormat:k?.tiebreakSet,tiebreakTo:e.target.value}}})},z=e=>{o({...t,[r?"finalSetFormat":"setFormat"]:{...k,tiebreakAt:e.target.value}})},G=e=>{const a=1===e.target.value;o({...t,[r?"finalSetFormat":"setFormat"]:{...k,[k?.tiebreakFormat?"tiebreakFormat":"tiebreakSet"]:{...k?.tiebreakFormat?k?.tiebreakFormat:k?.tiebreakSet,NoAD:a}}})},R=e=>{const a=e.target.value,n=p(a).reverse()[0];if(y)o({...t,setFormat:{timed:!0,minutes:a}});else if(r){const e=t?.finalSetFormat||{},r=t?.finalSetFormat?.tiebreakSet,i=r?{tiebreakSet:{tiebreakTo:a}}:{...e,setTo:a,tiebreakAt:n};o({...t,finalSetFormat:i})}else{const e=t?.setFormat||{},r=t?.setFormat?.tiebreakSet,i=r?{tiebreakSet:{tiebreakTo:a}}:{...e,setTo:a,tiebreakAt:n};o({...t,setFormat:i})}},V=e=>{const t=e.target.value;if(F({...T,what:t}),"T"===t)o({setFormat:{timed:!0,minutes:10},bestOf:1});else if("TB"===t){const e=r?{...k}:{tiebreakSet:{tiebreakTo:h||7}};o({bestOf:x,setFormat:e,finalSetFormat:r&&{tiebreakSet:{tiebreakTo:h||7}}})}else if("S"===t){const e=r?{...k}:{setTo:6,tiebreakAt:6,tiebreakFormat:{tiebreakTo:7}};o({bestOf:x,setFormat:e,finalSetFormat:r&&{setTo:6,tiebreakAt:6,tiebreakFormat:{tiebreakTo:7}}})}},X=e=>d.createElement(i.Z,{"data-test-id":e.key,key:e.key,disabled:e.disabled,value:e.key},e.name);return d.createElement(d.Fragment,null,d.createElement(l.Z,{container:!0,spacing:1,direction:"row",justify:"flex-start"},r?d.createElement(l.Z,{item:!0}," ",d.createElement(c.Z,{id:"ut-final-selector",value:"final"},w.map((e=>X(e))))," "):null,r?null:d.createElement(l.Z,{item:!0}," ",(()=>{if(!r)return d.createElement(c.Z,{id:"ut-exact-selector",value:B.reduce(((e,t)=>t.key===T.exact?t:e)).key,onChange:P},B.map((e=>X(e))))})()," "),r?null:d.createElement(l.Z,{item:!0}," ",(()=>{if(!r)return d.createElement(c.Z,{id:"ut-best-of-selector",value:x,onChange:L},v.map((e=>X(e))))})()," "),d.createElement(l.Z,{item:!0}," ",(()=>{if("S"===T.what)return d.createElement(c.Z,{value:!!D,onChange:$},O.map((e=>X(e))))})()," "),d.createElement(l.Z,{item:!0}," ",d.createElement(c.Z,{value:C.reduce(((e,t)=>t.key===T.what?t:e)).key,onChange:V},C.map((e=>X(e))))," "),d.createElement(l.Z,{item:!0}," ",d.createElement(c.Z,{value:y?E.reduce(((e,a)=>a.key===t?.minutes||a.key===t?.setFormat?.minutes?a:e)).key:"TB"===T.what?E.reduce(((e,t)=>t.key===h?t:e)).key:E.reduce(((e,t)=>t.key===k?.setTo?t:e)).key,onChange:R},E.map((e=>X(e))))," "),d.createElement(l.Z,{item:!0}," ",(()=>{if("S"===T.what&&(r?!S:!b))return d.createElement(c.Z,{value:h,onChange:W},j.map((e=>X(e))))})()," "),d.createElement(l.Z,{item:!0}," ",(()=>{if("S"===T.what&&(r?!S:!b)&&k?.setTo>1)return d.createElement(c.Z,{value:k?.tiebreakAt,onChange:z},I.map((e=>X(e))))})()," "),d.createElement(l.Z,{item:!0}," ",(()=>{if("T"!==T.what&&(r?!S:!b))return d.createElement(c.Z,{value:M?1:2,onChange:G},A.map((e=>X(e))))})()," ")),d.createElement(l.Z,{container:!0,direction:"row",justify:"flex-start"},d.createElement(l.Z,{item:!0},"S"!==T.what?"":d.createElement(m.Z,{control:d.createElement(s.Z,{checked:r?!S:!b,onChange:e=>{const a=r?{finalSetFormat:u(e,k,h)}:{setFormat:u(e,k,h)},n={...t,...a};o(n)},name:"scoring-format-tiebreak"}),label:"Tiebreak"})),d.createElement(l.Z,{item:!0},"T"===T.what||r||t?.bestOf<2?"":d.createElement(m.Z,{control:d.createElement(s.Z,{checked:a,onChange:e=>{o({...t,finalSetFormat:e.target.checked?{...k}:void 0})},name:"scoring-format-tiebreak"}),label:"Final Set"}))))};var f=a(343);const h=(0,f.Z)((()=>({root:{display:"flex",flexWrap:"wrap",maxWidth:"500px"},minimums:{minWidth:"230px",width:"100%"},spaceLeft:{marginLeft:"1em"},row:{marginTop:"1em",marginBotton:".5em"},matchUpFormatList:{marginBlockStart:0,marginBlockEnd:0,paddingInlineStart:0,listStyle:"none"},matchUpFormat:{padding:0},matchUpFormatDescription:{padding:0,fontSize:10}}))),b=e=>{let{disabled:t,matchUpFormatParsed:a,onChange:m}=e;const s=h(),p=function(){const e="SET3-S:6/TB7",t=[{key:"custom",name:"Custom",desc:""},{key:"standard",name:"Standard Advantage",format:"SET3-S:6/TB7",desc:"Best of 3 Sets to 6 with Advantage"},{key:"atpd",name:"Standard Doubles",format:"SET3-S:6/TB7-F:TB10",desc:"Best of 3 Sets to 6, no Ad",desc2:"Final Set Tiebreak to 10"},{key:"standard1",name:"One Standard Set",format:"SET1-S:6/TB7",desc:"1 Set to 6 Games, Tiebreak to 7"},{key:"wimbledon2018",name:"Wimbledon 2018",format:"SET5-S:6/TB7-F:6",desc:"Best of 5 tiebreak sets, final set no tiebreak"},{key:"wimbledon2019",name:"Wimbledon 2019",format:"SET5-S:6/TB7-F:6/TB7@12",desc:"Best of 5 tiebreak sets, final set tiebreak at 12"},{key:"Aus2019",name:"Australian Open 2019",format:"SET5-S:6/TB7-F:6/TB10",desc:"Best of 5 tiebreak sets, final set tiebreak at 12"},{key:"short",name:"Short Sets TB7@4",format:"SET3-S:4/TB7",desc:"Best of 3 Sets to 4, tiebreak to 7 at 4-4"},{key:"short1",name:"Fast 4",format:"SET3-S:4/TB5@3",desc:"Best of 3 Sets to 4, tiebreak to 5 at 3-3"},{key:"short2",name:"One Short Set TB7",format:"SET1-S:4/TB7",desc:"One Set to 4, tiebreak to 7 at 4-4"},{key:"short3",name:"One Short Set TB5",format:"SET1-S:4/TB5@3",desc:"One Set to 4, tiebreak to 5 at 3-3"},{key:"short4",name:"Short Sets w/ 3rd TB10",format:"SET3-S:4/TB7-F:TB10",desc:"Best of 3 Sets to 4 Games, tiebreak to 10",desc2:"3rd Set Tiebreak to 7"},{key:"short5",name:"Short Sets w/ 3rd TB7",format:"SET3-S:4/TB7-F:TB7",desc:"Best of 3 Sets to 4 Games, tiebreak to 7",desc2:"3rd Set Tiebreak to 7"},{key:"pro",name:"Pro Set",format:"SET1-S:8/TB7",desc:"One Set to 8 with Advantage, tiebreak at 8-8"},{key:"cps",name:"College Pro Set",format:"SET1-S:8/TB7@7"},{key:"tbsets1",name:"Best of 3 TB7",format:"SET3-S:TB7",desc:"Two tiebreak sets",desc2:"7-point match tiebreak at one set all"},{key:"tbsets2",name:"Best of 3 TB10",format:"SET3-S:TB10",desc:"Best of 3 tiebreaks to 10"},{key:"tbsets3",name:"One Tiebreak to 10",format:"SET1-S:TB10",desc:"One Match Tiebreak to 10 with Advantage"},{key:"tbsets4",name:"Two TB7 w/ 3rd TB10",format:"SET3-S:TB7-F:TB10",desc:"Two 7 point tiebreak sets",desc2:"10 point tiebreak at one set all"},{key:"timed10",name:"Timed 10 minute game - game based",format:"SET1-S:T10"}];return{formats:t.sort(((e,t)=>e.name>t.name?1:e.name<t.name?-1:0)),lookup:a=>t.reduce(((e,t)=>t.key===a?t.format:e),e),default:e}}().formats,u=a?.timed||a?.setFormat?.timed,f=e=>{m?.(e)},b=e=>f(e),S=a&&!!a.finalSetFormat,y=e=>{const t=e&&e.target&&e.target.value,a=p.find((e=>e.key===t))?.format,n=r.C9.parse(a);f(n)};function g(e){return d.createElement(i.Z,{key:e.key,value:e.key},d.createElement("ul",{className:s.matchUpFormatList},d.createElement("li",{className:s.matchUpFormat},e.name),e.desc?d.createElement("li",{key:`${e.key}_1`,style:{fontSize:10}},e.desc):"",e.desc2?d.createElement("li",{key:`${e.key}_2`,style:{fontSize:10}},e.desc2):""))}return d.createElement(d.Fragment,null,d.createElement(l.Z,{"justify-content":"flex-start",className:s.row,direction:"row",container:!0},d.createElement(l.Z,{item:!0,className:s.minimums},d.createElement(d.Fragment,null,d.createElement(n.Z,{style:{minWidth:120,width:"100%",margin:0,padding:0}},d.createElement(o.Z,null,"Scoring"),d.createElement(c.Z,{value:p.reduce(((e,t)=>t.format===r.C9.stringify(a)?t.key:e),void 0)||"custom",onChange:y},p.map(g)))))),d.createElement(d.Fragment,null,d.createElement(l.Z,{container:!0,direction:"row",justify:"flex-start",className:s.row},d.createElement(l.Z,{item:!0},d.createElement(k,{matchUpFormatParsed:a,disabled:t,onChange:b,hasFinalSet:S}),!S||u?null:d.createElement(k,{matchUpFormatParsed:a,disabled:t,isFinalSet:!0,onChange:b,hasFinalSet:S})))))};var S=a(553),y=a(4315);const g=(0,f.Z)((()=>({paper:{paddingTop:"2em",paddingLeft:"2em",paddingRight:"2em",paddingBottom:"2em",marginTop:"2em",marginLeft:"2em",maxWidth:"40em"}}))),T=()=>{const e=g(),[t,a]=(0,d.useState)(r.C9.parse("SET3-S:6/TB7"));return d.createElement(d.Fragment,null,d.createElement(y.Z,{className:e.paper,elevation:2},d.createElement(S.Z,{variant:"h5",component:"h3",style:{marginBottom:"1em"}},"TODS MatchUp Format Code Generator"),d.createElement(S.Z,{variant:"h5",component:"h3",style:{color:"blue"}},r.C9.stringify(t)),d.createElement(b,{matchUpFormatParsed:t,onChange:e=>a(e)})))}},4911:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>m,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>l});var r=a(8957),n=(a(959),a(7942)),o=a(7675);const i={title:"matchUpFormat Codes"},m=void 0,s={unversionedId:"codes/matchup-format",id:"codes/matchup-format",title:"matchUpFormat Codes",description:"Overview",source:"@site/docs/codes/matchup-format.mdx",sourceDirName:"codes",slug:"/codes/matchup-format",permalink:"/tods-competition-factory/docs/codes/matchup-format",draft:!1,tags:[],version:"current",frontMatter:{title:"matchUpFormat Codes"},sidebar:"docs",previous:{title:"Age Category Codes",permalink:"/tods-competition-factory/docs/codes/age-category"},next:{title:"Tournament Level",permalink:"/tods-competition-factory/docs/enums/tournament-level"}},c={},l=[{value:"Overview",id:"overview",level:2},{value:"Interactive Example",id:"interactive-example",level:2},{value:"parse and stringify",id:"parse-and-stringify",level:2},{value:"matchUpFormat discovery",id:"matchupformat-discovery",level:2},{value:"parse and stringify",id:"parse-and-stringify-1",level:2}],d={toc:l},p="wrapper";function u(e){let{components:t,...a}=e;return(0,n.kt)(p,(0,r.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h2",{id:"overview"},"Overview"),(0,n.kt)("p",null,"A ",(0,n.kt)("strong",{parentName:"p"},"matchUpFormat")," code describes the scoring method used for a specific ",(0,n.kt)("strong",{parentName:"p"},"matchUp"),", for all matchUps within a ",(0,n.kt)("strong",{parentName:"p"},"structure"),", for all matchUps within a ",(0,n.kt)("strong",{parentName:"p"},"drawDefinition"),", or for all matchUps within an ",(0,n.kt)("strong",{parentName:"p"},"event"),"."),(0,n.kt)("h2",{id:"interactive-example"},"Interactive Example"),(0,n.kt)("p",null,"Use the embedded component to dynamically generate ",(0,n.kt)("inlineCode",{parentName:"p"},"matchUpFormat")," codes:"),(0,n.kt)(o.Z,{mdxType:"Configurator"}),(0,n.kt)("h2",{id:"parse-and-stringify"},"parse and stringify"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-js"},"import { matchUpFormatCode } from 'tods-competition-factory';\n\nconst matchUpFormat = 'SET3-S:6/TB7';\n\n// validate matchUpFormat codes\nconst valid = matchUpFormatCode.isValid(matchUpFormat);\n\n// parse matchUpFormat codes into an object representation\n// tiebreakFormat and tiebreakSet are mutually exclusive\nconst {\n  bestOf,\n  setFormat: {\n    setTo,\n    tiebreakAt,\n    tiebreakFormat: { tiebreakTo },\n    tiebreakSet: { tiebreakTo },\n  },\n  finalSetFormat: {\n    setTo,\n    tiebreakAt,\n    tiebreakFormat: { tiebreakTo },\n    tiebreakSet: { tiebreakTo },\n  },\n} = matchUpFormatCode.parse(matchUpFormat);\n\n// stringify object representation\nconst result = matchUpFormatCode.stringify({\n  bestOf: 1,\n  setFormat: { timed: true, minutes: 20 },\n});\n")),(0,n.kt)("h2",{id:"matchupformat-discovery"},"matchUpFormat discovery"),(0,n.kt)("p",null,"In TODS, a ",(0,n.kt)("strong",{parentName:"p"},"drawDefinition")," is a collection of ",(0,n.kt)("strong",{parentName:"p"},"structures"),". For example, a MAIN ",(0,n.kt)("strong",{parentName:"p"},"structure")," and a CONSOLATION ",(0,n.kt)("strong",{parentName:"p"},"structure")," are considered to be part of the same ",(0,n.kt)("strong",{parentName:"p"},"drawDefinition")," because they have a logical relationship whereby participants move from one ",(0,n.kt)("strong",{parentName:"p"},"structure")," to another."),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-js"}," tournament.events[].drawDefinitions[].structures[].matchUps[]\n")),(0,n.kt)("p",null,"An application using the Competition Factory can request the ",(0,n.kt)("strong",{parentName:"p"},"matchUpFormat")," for a given ",(0,n.kt)("strong",{parentName:"p"},"matchUp")," and the ",(0,n.kt)("strong",{parentName:"p"},"tournamentEngine")," will traverse the hierarchy from bottom up looking to see at what level a ",(0,n.kt)("strong",{parentName:"p"},"matchUpFormat")," has been defined. This method will also return any ",(0,n.kt)("strong",{parentName:"p"},"matchUpFormat")," codes encountered in the hierarchy within which a ",(0,n.kt)("strong",{parentName:"p"},"matchUp")," is found:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-js"},"const { matchUpFormat } = tournamentEngine.getMatchUpFormat({\n  drawId,\n  matchUpId,\n});\n")),(0,n.kt)("p",null,"To set the ",(0,n.kt)("strong",{parentName:"p"},"matchUpFormat")," at each level:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-js"},"tournamentEngine.setMatchUpFormat({\n  matchUpFormat,\n  structureId, // optional\n  eventId, // optional\n  drawId, // optional\n});\n")),(0,n.kt)("p",null,"The ",(0,n.kt)("strong",{parentName:"p"},"matchUpFormat")," for a ",(0,n.kt)("strong",{parentName:"p"},"matchUp")," is set at the time of score entry:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-js"},"tournamentEngine.setMatchUpStatus({\n  matchUpFormat,\n  matchUpId,\n  outcome,\n  drawId,\n});\n")),(0,n.kt)("h2",{id:"parse-and-stringify-1"},"parse and stringify"),(0,n.kt)("p",null,"The Competition Factory utilizes ",(0,n.kt)("inlineCode",{parentName:"p"},"matchUpFormatCode")," utilities primarily for validation, but also in the calculation of Round Robin results when determining group finishing positions."),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-js"},"import { matchUpFormatCode } from 'tods-competition-factory';\n\nconst matchUpFormat = 'SET3-S:6/TB7';\n\n// validate matchUpFormat codes\nconst valid = matchUpFormatCode.isValid(matchUpFormat);\n\n// parse matchUpFormat codes into an object representation\nconst {\n  bestOf,\n  setFormat: {\n    setTo,\n    tiebreakAt,\n    tiebreakFormat: { tiebreakTo },\n  },\n  finalSetFormat: {\n    setTo,\n    tiebreakAt,\n    tiebreakFormat: { tiebreakTo },\n  },\n} = matchUpFormatCode.parse(matchUpFormat);\n\n// stringify object representation\nconst result = matchUpFormatCode.stringify({\n  bestOf: 1,\n  setFormat: { timed: true, minutes: 20 },\n});\n")))}u.isMDXComponent=!0},8592:(e,t,a)=>{function r(e,t){(null==t||t>e.length)&&(t=e.length);for(var a=0,r=new Array(t);a<t;a++)r[a]=e[a];return r}a.d(t,{Z:()=>r})},689:(e,t,a)=>{a.d(t,{Z:()=>n});var r=a(6236);function n(e,t,a){return(t=(0,r.Z)(t))in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}},3387:(e,t,a)=>{a.d(t,{Z:()=>n});var r=a(9373);function n(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var a=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=a){var r,n,o,i,m=[],s=!0,c=!1;try{if(o=(a=a.call(e)).next,0===t){if(Object(a)!==a)return;s=!1}else for(;!(s=(r=o.call(a)).done)&&(m.push(r.value),m.length!==t);s=!0);}catch(e){c=!0,n=e}finally{try{if(!s&&null!=a.return&&(i=a.return(),Object(i)!==i))return}finally{if(c)throw n}}return m}}(e,t)||(0,r.Z)(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}},6236:(e,t,a)=>{a.d(t,{Z:()=>n});var r=a(6188);function n(e){var t=function(e,t){if("object"!==(0,r.Z)(e)||null===e)return e;var a=e[Symbol.toPrimitive];if(void 0!==a){var n=a.call(e,t||"default");if("object"!==(0,r.Z)(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"===(0,r.Z)(t)?t:String(t)}},6188:(e,t,a)=>{function r(e){return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r(e)}a.d(t,{Z:()=>r})},9373:(e,t,a)=>{a.d(t,{Z:()=>n});var r=a(8592);function n(e,t){if(e){if("string"==typeof e)return(0,r.Z)(e,t);var a=Object.prototype.toString.call(e).slice(8,-1);return"Object"===a&&e.constructor&&(a=e.constructor.name),"Map"===a||"Set"===a?Array.from(e):"Arguments"===a||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)?(0,r.Z)(e,t):void 0}}}}]);