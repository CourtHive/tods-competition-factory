"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[5964],{4460:(e,t,n)=>{n.d(t,{Z:()=>b});var i=n(7294),o=n(2564),s=n(578);const a=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),r=(e,t,n)=>{let{style:i}=e;return{style:{...i,color:Number.isNaN(n[0])||parseInt(n,10)%2?i.color:"#33F"}}},c=(e,t,n)=>{let{style:i}=e;return{style:{...i,fontWeight:n?"bold":i.textTransform}}},l=(e,t)=>{let{style:n}=e;return{style:{...n,borderRadius:"Boolean"===t?3:n.borderRadius}}},d=(e,t,n)=>{const s="object"==typeof t,a=s&&Object.values(t)[0],r="string"==typeof a&&"{"===a[0];let c;if(s){const e=Object.keys(t);2!==o.hC.intersection(e,["drawId","drawType"]).length||e.includes("drawRepresentativeIds")||(c="drawDefinition"),2!==o.hC.intersection(e,["entryPosition","entryStatus"]).length||e.includes("entryStageSequence")||(c="entry"),3!==o.hC.intersection(e,["eventId","sortOrder","notBeforeTime"]).length||e.includes("tennisOfficialIds")?2!==o.hC.intersection(e,["eventId","eventName"]).length||e.includes("tennisOfficialIds")||(c="event"):c="round",2===o.hC.intersection(e,["flightNumber","drawId"]).length&&(c="flight"),2===o.hC.intersection(e,["name","value"]).length&&(c="extension"),2!==o.hC.intersection(e,["linkType","source"]).length||e.includes("linkCondition")||(c="link"),2!==o.hC.intersection(e,["matchUpId","drawPositions"]).length||e.includes("surfaceCategory")||(c="matchUp"),2===o.hC.intersection(e,["drawPosition","participantId","bye"]).length&&(c="positionAssignment"),2!==o.hC.intersection(e,["courtId","dateAvailability"]).length||e.includes("altitude")||(c="court"),2!==o.hC.intersection(e,["participantId","participantName"]).length||e.includes("onlineResources")||(c="participant"),2===o.hC.intersection(e,["structureId","structureName"]).length&&(c="structure"),2!==o.hC.intersection(e,["venueId","courts"]).length||e.includes("venueOtherIds")||(c="venue")}return i.createElement("span",null,c||(r?e:n))},p=e=>{return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?(e=>{try{const t=JSON.parse(JSON.parse(e)),n="true"===t.required?"":"? ",i="true"===t.array?"[]":"";return n+": "+(["any","boolean","number","string"].includes(t.type)?t.type:"object"===t.type?t.object||"Object":"enum"===t.type?"enum "+t.enum:"")+i+(t.note?" \\\\ "+t.note:"")}catch(t){return""}})(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},u=e=>{let[t]=e;return i.createElement("strong",null,t)},b=e=>{let{colorScheme:t="summerfruit",sortObjectKeys:n=!0,invertTheme:o=!0,expandRoot:b=!0,expandToLevel:m=1,hideRoot:f=!1,root:h="root",data:y}=e;return i.createElement("div",{style:{marginBottom:"1em"}},i.createElement(s.L,{theme:{valueLabel:r,nestedNodeLabel:c,extend:a[t],value:l},shouldExpandNode:(e,t,n)=>!!b&&(("object"!=typeof t||!t._typeDef)&&(n<m||void 0)),sortObjectKeys:n,getItemString:d,labelRenderer:u,valueRenderer:p,invertTheme:o,hideRoot:f,keyPath:[h],data:y}))}},6107:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>c,default:()=>b,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var i=n(7462),o=(n(7294),n(3905)),s=n(4460);const a=JSON.parse('{"positionActions":{"policyName":"positionActionsDefault","enabledStructures":[{"stages":["QUALIFYING","MAIN"],"stageSequences":[1],"structureTypes":[],"enabledActions":[],"disabledActions":[],"feedProfiles":[]},{"stages":[],"stageSequences":[],"structureTypes":[],"enabledActions":["SEED_VALUE","ADD_NICKNAME","ADD_PENALTY","QUALIFIER"],"disabledActions":[],"feedProfiles":[]}],"disbledStructures":[],"otherFlightEntries":false}}'),r={title:"Position Actions"},c=void 0,l={unversionedId:"policies/positionActions",id:"policies/positionActions",title:"Position Actions",description:"See Actions for context.",source:"@site/docs/policies/positionActions.mdx",sourceDirName:"policies",slug:"/policies/positionActions",permalink:"/tods-competition-factory/docs/policies/positionActions",draft:!1,tags:[],version:"current",frontMatter:{title:"Position Actions"},sidebar:"docs",previous:{title:"Accessors",permalink:"/tods-competition-factory/docs/policies/accessors"},next:{title:"Participant Policy",permalink:"/tods-competition-factory/docs/policies/participantPolicy"}},d={},p=[{value:"policyDefinitions Example",id:"policydefinitions-example",level:3}],u={toc:p};function b(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,i.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"See ",(0,o.kt)("a",{parentName:"p",href:"/docs/concepts/actions"},"Actions")," for context."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"positionActions")," returns an array of valid actions for a specified drawPosition. Valid actions can be determined, in part, by\n",(0,o.kt)("inlineCode",{parentName:"p"},"policyDefinitions"),". In the Competition Factory source there are four examples of position action policies:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"Default position actions"),(0,o.kt)("li",{parentName:"ol"},"No movement (disallows swapping participants & etc.)"),(0,o.kt)("li",{parentName:"ol"},"Disabled position actions"),(0,o.kt)("li",{parentName:"ol"},"Unrestricted position actions (all available actions)")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"const { positionActions } = tournamentEngine.positionActions({\n  policyDefinitions, // optional - can be attached to tournamentRecord, event, or draw\n  drawPosition,\n  eventId,\n  drawId,\n});\n")),(0,o.kt)("h3",{id:"policydefinitions-example"},"policyDefinitions Example"),(0,o.kt)(s.Z,{data:a,root:"policyDefinitions",colorScheme:"summerfruit",invertTheme:!0,expandToLevel:1,mdxType:"RenderJSON"}))}b.isMDXComponent=!0}}]);