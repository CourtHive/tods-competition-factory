"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7918],{7675:(e,t,a)=>{a.d(t,{Z:()=>g});var r=a(7705),n=a(5834),o=a(2306),s=a(9434),i=a(4117),m=a(591),l=a(1334),c=a(7259),d=a(959);const b=e=>{const t=[e];return e>1&&t.unshift(e-1),t},u=(e,t,a)=>({setTo:t.setTo,noTiebreak:!e.target.checked,tiebreakAt:e.target.checked&&(t.tiebreakAt||t.setTo),[t.tiebreakSet?"tiebreakSet":"tiebreakFormat"]:{tiebreakTo:e.target.checked&&(a||7)}}),k=e=>{let{matchUpFormatParsed:t,hasFinalSet:a,isFinalSet:r,disabled:n,onChange:o}=e;const k=r?t?.finalSetFormat:t?.setFormat,f=k?.tiebreakSet,h=k?.tiebreakFormat?.tiebreakTo||k?.tiebreakSet?.tiebreakTo,S=t?.setFormat&&t?.setFormat?.noTiebreak,y=t?.finalSetFormat&&t?.finalSetFormat?.noTiebreak,p=k?.timed,T={exact:1===t?.bestOf?"exact":"bestof",what:(f?"TB":k?.setTo&&"S")||p&&"T"||"S"},[g,E]=(0,d.useState)(T),F=["S","TB"].indexOf(g.what)>=0&&[1,3,5].map((e=>({key:e,name:e})))||[1,3,5].map((e=>({key:e,name:e}))),B="T"===g.what?[10,15,20,25,30,45,60,90].map((e=>({name:`${e} Minutes`,key:e}))):"TB"===g.what?[5,7,9,10,11,12,15,21].map((e=>({name:`to ${e}`,key:e}))):[1,2,3,4,5,6,7,8,9].map((e=>({name:`to ${e}`,key:e}))),v=[{key:"final",name:"Final Set"}],w=1===t?.bestOf?[{key:"exact",name:"Exactly"}]:[{key:"bestof",name:"Best Of"},{key:"exact",name:"Exactly"}],C=e=>(n||[]).indexOf(e)>=0,Z=[{key:"S",name:"Set"},{key:"TB",name:"Tiebreak"},{disabled:C("timed")||r,name:"Timed Set",key:"T"}],O=[{key:"S",name:"Sets"},{key:"TB",name:"Tiebreaks"},{key:"T",name:"Timed Sets",disabled:C("timed")||r}],A=!t?.bestOf||1===t?.bestOf||r?Z:O,x=[{key:!1,name:"Ad"},{key:!0,name:"No Ad"}],N=[1,2].map((e=>({key:e,name:`Win by ${e}`}))),D=t?.bestOf||F[0].key,R=[5,7,9,10,12].map((e=>({name:`TB to: ${e}`,key:e}))),I=b(k?.setTo).map((e=>({name:`@ ${e}`,key:e}))),U=k?.NoAD,$=!!k?.tiebreakFormat?.NoAD||!!k?.tiebreakSet?.NoAD,j=e=>{E({...g,exact:e.target.value})},P=e=>{o({...t,bestOf:e.target.value||1})},L=e=>{o({...t,[r?"finalSetFormat":"setFormat"]:{...k,NoAD:e.target.value}})},W=e=>{o({...t,[r?"finalSetFormat":"setFormat"]:{...k,[k?.tiebreakFormat?"tiebreakFormat":"tiebreakSet"]:{...k?.tiebreakFormat?k?.tiebreakFormat:k?.tiebreakSet,tiebreakTo:e.target.value}}})},z=e=>{o({...t,[r?"finalSetFormat":"setFormat"]:{...k,tiebreakAt:e.target.value}})},M=e=>{const a=1===e.target.value;o({...t,[r?"finalSetFormat":"setFormat"]:{...k,[k?.tiebreakFormat?"tiebreakFormat":"tiebreakSet"]:{...k?.tiebreakFormat?k?.tiebreakFormat:k?.tiebreakSet,NoAD:a}}})},G=e=>{const a=e.target.value,n=b(a).reverse()[0];if(p)o({...t,setFormat:{timed:!0,minutes:a}});else if(r){const e=t?.finalSetFormat||{},r=t?.finalSetFormat?.tiebreakSet,s=r?{tiebreakSet:{tiebreakTo:a}}:{...e,setTo:a,tiebreakAt:n};o({...t,finalSetFormat:s})}else{const e=t?.setFormat||{},r=t?.setFormat?.tiebreakSet,s=r?{tiebreakSet:{tiebreakTo:a}}:{...e,setTo:a,tiebreakAt:n};o({...t,setFormat:s})}},J=e=>{const t=e.target.value;if(E({...g,what:t}),"T"===t)o({setFormat:{timed:!0,minutes:10},bestOf:1});else if("TB"===t){const e=r?{...k}:{tiebreakSet:{tiebreakTo:h||7}};o({bestOf:D,setFormat:e,finalSetFormat:r&&{tiebreakSet:{tiebreakTo:h||7}}})}else if("S"===t){const e=r?{...k}:{setTo:6,tiebreakAt:6,tiebreakFormat:{tiebreakTo:7}};o({bestOf:D,setFormat:e,finalSetFormat:r&&{setTo:6,tiebreakAt:6,tiebreakFormat:{tiebreakTo:7}}})}},_=e=>d.createElement(s.Z,{"data-test-id":e.key,key:e.key,disabled:e.disabled,value:e.key},e.name);return d.createElement(d.Fragment,null,d.createElement(c.Z,{container:!0,spacing:1,direction:"row",justify:"flex-start"},r?d.createElement(c.Z,{item:!0}," ",d.createElement(l.Z,{id:"ut-final-selector",value:"final"},v.map((e=>_(e))))," "):null,r?null:d.createElement(c.Z,{item:!0}," ",(()=>{if(!r)return d.createElement(l.Z,{id:"ut-exact-selector",value:w.reduce(((e,t)=>t.key===g.exact?t:e)).key,onChange:j},w.map((e=>_(e))))})()," "),r?null:d.createElement(c.Z,{item:!0}," ",(()=>{if(!r)return d.createElement(l.Z,{id:"ut-best-of-selector",value:D,onChange:P},F.map((e=>_(e))))})()," "),d.createElement(c.Z,{item:!0}," ",(()=>{if("S"===g.what)return d.createElement(l.Z,{value:!!U,onChange:L},x.map((e=>_(e))))})()," "),d.createElement(c.Z,{item:!0}," ",d.createElement(l.Z,{value:A.reduce(((e,t)=>t.key===g.what?t:e)).key,onChange:J},A.map((e=>_(e))))," "),d.createElement(c.Z,{item:!0}," ",d.createElement(l.Z,{value:p?B.reduce(((e,a)=>a.key===t?.minutes||a.key===t?.setFormat?.minutes?a:e)).key:"TB"===g.what?B.reduce(((e,t)=>t.key===h?t:e)).key:B.reduce(((e,t)=>t.key===k?.setTo?t:e)).key,onChange:G},B.map((e=>_(e))))," "),d.createElement(c.Z,{item:!0}," ",(()=>{if("S"===g.what&&(r?!y:!S))return d.createElement(l.Z,{value:h,onChange:W},R.map((e=>_(e))))})()," "),d.createElement(c.Z,{item:!0}," ",(()=>{if("S"===g.what&&(r?!y:!S)&&k?.setTo>1)return d.createElement(l.Z,{value:k?.tiebreakAt,onChange:z},I.map((e=>_(e))))})()," "),d.createElement(c.Z,{item:!0}," ",(()=>{if("T"!==g.what&&(r?!y:!S))return d.createElement(l.Z,{value:$?1:2,onChange:M},N.map((e=>_(e))))})()," ")),d.createElement(c.Z,{container:!0,direction:"row",justify:"flex-start"},d.createElement(c.Z,{item:!0},"S"!==g.what?"":d.createElement(i.Z,{control:d.createElement(m.Z,{checked:r?!y:!S,onChange:e=>{const a=r?{finalSetFormat:u(e,k,h)}:{setFormat:u(e,k,h)},n={...t,...a};o(n)},name:"scoring-format-tiebreak"}),label:"Tiebreak"})),d.createElement(c.Z,{item:!0},"T"===g.what||r||t?.bestOf<2?"":d.createElement(i.Z,{control:d.createElement(m.Z,{checked:a,onChange:e=>{o({...t,finalSetFormat:e.target.checked?{...k}:void 0})},name:"scoring-format-tiebreak"}),label:"Final Set"}))))};var f=a(1788);const h=(0,f.Z)((()=>({root:{display:"flex",flexWrap:"wrap",maxWidth:"500px"},minimums:{minWidth:"230px",width:"100%"},spaceLeft:{marginLeft:"1em"},row:{marginTop:"1em",marginBotton:".5em"},matchUpFormatList:{marginBlockStart:0,marginBlockEnd:0,paddingInlineStart:0,listStyle:"none"},matchUpFormat:{padding:0},matchUpFormatDescription:{padding:0,fontSize:10}}))),S=e=>{let{disabled:t,matchUpFormatParsed:a,onChange:i}=e;const m=h(),b=function(){const e="SET3-S:6/TB7",t=[{key:"custom",name:"Custom",desc:""},{key:"standard",name:"Standard Advantage",format:"SET3-S:6/TB7",desc:"Best of 3 Sets to 6 with Advantage"},{key:"atpd",name:"Standard Doubles",format:"SET3-S:6/TB7-F:TB10",desc:"Best of 3 Sets to 6, no Ad",desc2:"Final Set Tiebreak to 10"},{key:"standard1",name:"One Standard Set",format:"SET1-S:6/TB7",desc:"1 Set to 6 Games, Tiebreak to 7"},{key:"wimbledon2018",name:"Wimbledon 2018",format:"SET5-S:6/TB7-F:6",desc:"Best of 5 tiebreak sets, final set no tiebreak"},{key:"wimbledon2019",name:"Wimbledon 2019",format:"SET5-S:6/TB7-F:6/TB7@12",desc:"Best of 5 tiebreak sets, final set tiebreak at 12"},{key:"Aus2019",name:"Australian Open 2019",format:"SET5-S:6/TB7-F:6/TB10",desc:"Best of 5 tiebreak sets, final set tiebreak at 12"},{key:"short",name:"Short Sets TB7@4",format:"SET3-S:4/TB7",desc:"Best of 3 Sets to 4, tiebreak to 7 at 4-4"},{key:"short1",name:"Fast 4",format:"SET3-S:4/TB5@3",desc:"Best of 3 Sets to 4, tiebreak to 5 at 3-3"},{key:"short2",name:"One Short Set TB7",format:"SET1-S:4/TB7",desc:"One Set to 4, tiebreak to 7 at 4-4"},{key:"short3",name:"One Short Set TB5",format:"SET1-S:4/TB5@3",desc:"One Set to 4, tiebreak to 5 at 3-3"},{key:"short4",name:"Short Sets w/ 3rd TB10",format:"SET3-S:4/TB7-F:TB10",desc:"Best of 3 Sets to 4 Games, tiebreak to 10",desc2:"3rd Set Tiebreak to 7"},{key:"short5",name:"Short Sets w/ 3rd TB7",format:"SET3-S:4/TB7-F:TB7",desc:"Best of 3 Sets to 4 Games, tiebreak to 7",desc2:"3rd Set Tiebreak to 7"},{key:"pro",name:"Pro Set",format:"SET1-S:8/TB7",desc:"One Set to 8 with Advantage, tiebreak at 8-8"},{key:"cps",name:"College Pro Set",format:"SET1-S:8/TB7@7"},{key:"tbsets1",name:"Best of 3 TB7",format:"SET3-S:TB7",desc:"Two tiebreak sets",desc2:"7-point match tiebreak at one set all"},{key:"tbsets2",name:"Best of 3 TB10",format:"SET3-S:TB10",desc:"Best of 3 tiebreaks to 10"},{key:"tbsets3",name:"One Tiebreak to 10",format:"SET1-S:TB10",desc:"One Match Tiebreak to 10 with Advantage"},{key:"tbsets4",name:"Two TB7 w/ 3rd TB10",format:"SET3-S:TB7-F:TB10",desc:"Two 7 point tiebreak sets",desc2:"10 point tiebreak at one set all"},{key:"timed10",name:"Timed 10 minute game - game based",format:"SET1-S:T10"}];return{formats:t.sort(((e,t)=>e.name>t.name?1:e.name<t.name?-1:0)),lookup:a=>t.reduce(((e,t)=>t.key===a?t.format:e),e),default:e}}().formats,u=a?.setFormat?.timed,f=e=>{i?.(e)},S=e=>f(e),y=a&&!!a.finalSetFormat,p=e=>{const t=e&&e.target&&e.target.value,a=b.find((e=>e.key===t))?.format,n=r.C9.parse(a);f(n)};function T(e){return d.createElement(s.Z,{key:e.key,value:e.key},d.createElement("ul",{className:m.matchUpFormatList},d.createElement("li",{className:m.matchUpFormat},e.name),e.desc?d.createElement("li",{key:`${e.key}_1`,style:{fontSize:10}},e.desc):"",e.desc2?d.createElement("li",{key:`${e.key}_2`,style:{fontSize:10}},e.desc2):""))}return d.createElement(d.Fragment,null,d.createElement(c.Z,{"justify-content":"flex-start",className:m.row,direction:"row",container:!0},d.createElement(c.Z,{item:!0,className:m.minimums},d.createElement(d.Fragment,null,d.createElement(n.Z,{style:{minWidth:120,width:"100%",margin:0,padding:0}},d.createElement(o.Z,null,"Scoring"),d.createElement(l.Z,{value:b.reduce(((e,t)=>t.format===r.C9.stringify(a)?t.key:e),void 0)||"custom",onChange:p},b.map(T)))))),d.createElement(d.Fragment,null,d.createElement(c.Z,{container:!0,direction:"row",justify:"flex-start",className:m.row},d.createElement(c.Z,{item:!0},d.createElement(k,{matchUpFormatParsed:a,disabled:t,onChange:S,hasFinalSet:y}),!y||u?null:d.createElement(k,{matchUpFormatParsed:a,disabled:t,isFinalSet:!0,onChange:S,hasFinalSet:y})))))};var y=a(9985),p=a(4232);const T=(0,f.Z)((()=>({paper:{paddingTop:"2em",paddingLeft:"2em",paddingRight:"2em",paddingBottom:"2em",marginTop:"2em",marginLeft:"2em",maxWidth:"40em"}}))),g=()=>{const e=T(),[t,a]=(0,d.useState)(r.C9.parse("SET3-S:6/TB7"));return d.createElement(d.Fragment,null,d.createElement(p.Z,{className:e.paper,elevation:2},d.createElement(y.Z,{variant:"h5",component:"h3",style:{marginBottom:"1em"}},"TODS MatchUp Format Code Generator"),d.createElement(y.Z,{variant:"h5",component:"h3",style:{color:"blue"}},r.C9.stringify(t)),d.createElement(S,{matchUpFormatParsed:t,onChange:e=>a(e)})))}},7307:(e,t,a)=>{a.d(t,{Z:()=>u});var r=a(959),n=a(7705),o=a(6352);const s=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),i=(e,t,a)=>{let{style:r}=e;return{style:{...r,color:Number.isNaN(a[0])||parseInt(a,10)%2?r.color:"#33F"}}},m=(e,t,a)=>{let{style:r}=e;return{style:{...r,fontWeight:a?"bold":r.textTransform}}},l=(e,t)=>{let{style:a}=e;return{style:{...a,borderRadius:"Boolean"===t?3:a.borderRadius}}},c=(e,t,a)=>{const o="object"==typeof t,s=o&&Object.values(t)[0],i="string"==typeof s&&"{"===s[0];let m;if(o){const e=Object.keys(t);2!==n.hC.intersection(e,["drawId","drawType"]).length||e.includes("drawRepresentativeIds")||(m="drawDefinition"),2!==n.hC.intersection(e,["entryPosition","entryStatus"]).length||e.includes("entryStageSequence")||(m="entry"),3!==n.hC.intersection(e,["eventId","sortOrder","notBeforeTime"]).length||e.includes("tennisOfficialIds")?2!==n.hC.intersection(e,["eventId","eventName"]).length||e.includes("tennisOfficialIds")||(m="event"):m="round",2===n.hC.intersection(e,["flightNumber","drawId"]).length&&(m="flight"),2===n.hC.intersection(e,["name","value"]).length&&(m="extension"),2!==n.hC.intersection(e,["linkType","source"]).length||e.includes("linkCondition")||(m="link"),2!==n.hC.intersection(e,["matchUpId","drawPositions"]).length||e.includes("surfaceCategory")||(m="matchUp"),2===n.hC.intersection(e,["drawPosition","participantId","bye"]).length&&(m="positionAssignment"),2!==n.hC.intersection(e,["courtId","dateAvailability"]).length||e.includes("altitude")||(m="court"),2!==n.hC.intersection(e,["participantId","participantName"]).length||e.includes("onlineResources")||(m="participant"),2===n.hC.intersection(e,["structureId","structureName"]).length&&(m="structure"),2!==n.hC.intersection(e,["venueId","courts"]).length||e.includes("venueOtherIds")||(m="venue")}return r.createElement("span",null,m||(i?e:a))},d=e=>{return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?(e=>{try{const t=JSON.parse(JSON.parse(e)),a="true"===t.required?"":"? ",r="true"===t.array?"[]":"";return`${a}: ${["any","boolean","number","string"].includes(t.type)&&t.type||"object"===t.type&&t.object||"enum"===t.type?`enum ${t.enum}`:""}${r}${t.note?` \\\\ ${t.note}`:""}`}catch(t){return""}})(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},b=e=>{let[t]=e;return r.createElement("strong",null,t)},u=e=>{let{colorScheme:t="summerfruit",sortObjectKeys:a=!0,invertTheme:n=!0,expandRoot:u=!0,expandToLevel:k=1,hideRoot:f=!1,root:h="root",data:S}=e;return r.createElement("div",{style:{marginBottom:"1em"}},r.createElement(o.L,{theme:{valueLabel:i,nestedNodeLabel:m,extend:s[t],value:l},shouldExpandNode:(e,t,a)=>!!u&&(("object"!=typeof t||!t._typeDef)&&(a<k||void 0)),sortObjectKeys:a,getItemString:c,labelRenderer:b,valueRenderer:d,invertTheme:n,hideRoot:f,keyPath:[h],data:S}))}},159:(e,t,a)=>{a.d(t,{Z:()=>k});var r=a(7705),n=a(959);const o=e=>{let{grouping:t}=e;const a=Object.keys(r.SX);if(!a.includes(t))return a;const o=(e,t)=>n.createElement("pre",{key:t},e),s=r.SX[t];return Array.isArray(s)?s.map(o):Object.keys(s).map(o)};var s=a(7307);const i=e=>{let{data:t}=e;return n.createElement("div",null,n.createElement(s.Z,{data:t,root:"tournamentRecord",expandRoot:!1}))},m=e=>{let{data:t}=e;return n.createElement("div",null,n.createElement("div",null,"Participants Count: ",t.length),n.createElement(s.Z,{data:t,root:"participants",expandRoot:!1}))};var l=a(7675);const c=e=>{let{data:t,rowJoiner:a,tableHeight:r="300px"}=e;const o=t.split(a);return n.createElement("table",{style:{height:r,overflow:"auto"}},n.createElement("thead",null,n.createElement("tr",null,o[0].split(",").map(((e,t)=>n.createElement("th",{style:{position:"sticky",zIndex:1,top:0,background:"#eee"},key:t},e))))),n.createElement("tbody",null,o.slice(1).map(((e,t)=>n.createElement("tr",{key:t},e.split(",").map(((e,a)=>n.createElement("td",{nowrap:"nowrap",key:`${t}-${a}`},e))))))))},d=e=>{let{data:t}=e;return n.createElement("div",null,n.createElement(s.Z,{root:"drawDefinition",expandRoot:!1,hideRoot:!1,data:t}))},b=e=>{let{data:t}=e;const a=Array.isArray(t)?t.length:t&&t.matchUpsCount||0;return n.createElement("div",null,n.createElement("div",null,"MatchUps Count: ",a),n.createElement(s.Z,{data:t,root:"matchUps",expandRoot:!1}))},u=r.M6.version();console.log(`%cfactory: ${u}`,"color: lightblue");const k={React:n,...n,utilities:r.hC,drawEngine:r.y1,mocksEngine:r.QO,competitionEngine:r.aX,tournamentEngine:r.M6,scoreGovernor:r._3,ConstantsViewer:o,Configurator:l.Z,Participants:m,Tournament:i,RenderJSON:s.Z,RenderCSV:c,MatchUps:b,Draw:d}}}]);