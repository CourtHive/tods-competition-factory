"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2267],{4460:(e,t,n)=>{n.d(t,{Z:()=>m});var s=n(7294),a=n(5899),i=n(578);const o=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),r=(e,t,n)=>{let{style:s}=e;return{style:{...s,color:Number.isNaN(n[0])||parseInt(n,10)%2?s.color:"#33F"}}},c=(e,t,n)=>{let{style:s}=e;return{style:{...s,fontWeight:n?"bold":s.textTransform}}},l=(e,t)=>{let{style:n}=e;return{style:{...n,borderRadius:"Boolean"===t?3:n.borderRadius}}},u=(e,t,n)=>{const i="object"==typeof t,o=i&&Object.values(t)[0],r="string"==typeof o&&"{"===o[0];let c;if(i){const e=Object.keys(t);2!==a.utilities.intersection(e,["drawId","drawType"]).length||e.includes("drawRepresentativeIds")||(c="drawDefinition"),2!==a.utilities.intersection(e,["entryPosition","entryStatus"]).length||e.includes("entryStageSequence")||(c="entry"),3!==a.utilities.intersection(e,["eventId","sortOrder","notBeforeTime"]).length||e.includes("tennisOfficialIds")?2!==a.utilities.intersection(e,["eventId","eventName"]).length||e.includes("tennisOfficialIds")||(c="event"):c="round",2===a.utilities.intersection(e,["flightNumber","drawId"]).length&&(c="flight"),2===a.utilities.intersection(e,["name","value"]).length&&(c="extension"),2!==a.utilities.intersection(e,["linkType","source"]).length||e.includes("linkCondition")||(c="link"),2!==a.utilities.intersection(e,["matchUpId","drawPositions"]).length||e.includes("surfaceCategory")||(c="matchUp"),2===a.utilities.intersection(e,["drawPosition","participantId","bye"]).length&&(c="positionAssignment"),2!==a.utilities.intersection(e,["courtId","dateAvailability"]).length||e.includes("altitude")||(c="court"),2!==a.utilities.intersection(e,["participantId","participantName"]).length||e.includes("onlineResources")||(c="participant"),2===a.utilities.intersection(e,["structureId","structureName"]).length&&(c="structure"),2!==a.utilities.intersection(e,["venueId","courts"]).length||e.includes("venueOtherIds")||(c="venue")}return s.createElement("span",null,c||(r?e:n))},p=e=>{return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?(e=>{try{const t=JSON.parse(JSON.parse(e)),n="true"===t.required?"":"? ",s="true"===t.array?"[]":"";return n+": "+(["any","boolean","number","string"].includes(t.type)?t.type:"object"===t.type?t.object||"Object":"enum"===t.type?"enum "+t.enum:"")+s+(t.note?" \\\\ "+t.note:"")}catch(t){return""}})(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},d=e=>{let[t]=e;return s.createElement("strong",null,t)},m=e=>{let{colorScheme:t="summerfruit",sortObjectKeys:n=!0,invertTheme:a=!0,expandRoot:m=!0,expandToLevel:b=1,hideRoot:f=!1,root:h="root",data:g}=e;return s.createElement("div",{style:{marginBottom:"1em"}},s.createElement(i.L,{theme:{valueLabel:r,nestedNodeLabel:c,extend:o[t],value:l},shouldExpandNode:(e,t,n)=>!!m&&(("object"!=typeof t||!t._typeDef)&&(n<b||void 0)),sortObjectKeys:n,getItemString:u,labelRenderer:d,valueRenderer:p,invertTheme:a,hideRoot:f,keyPath:[h],data:g}))}},7062:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>r,default:()=>d,frontMatter:()=>o,metadata:()=>c,toc:()=>u});var s=n(7462),a=(n(7294),n(3905)),i=n(4460);const o={title:"Accessors"},r=void 0,c={unversionedId:"concepts/accessors",id:"concepts/accessors",title:"Accessors",description:"Accessors are used to specify the location of data values in JSON objects. Avoidance policies and participant filters are examples of accessors being used to target values.",source:"@site/docs/concepts/accessors.mdx",sourceDirName:"concepts",slug:"/concepts/accessors",permalink:"/tods-competition-factory/docs/concepts/accessors",draft:!1,tags:[],version:"current",frontMatter:{title:"Accessors"},sidebar:"docs",previous:{title:"Actions",permalink:"/tods-competition-factory/docs/concepts/actions"},next:{title:"Context",permalink:"/tods-competition-factory/docs/concepts/context"}},l={},u=[],p={toc:u};function d(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,s.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Accessors are used to specify the location of data values in JSON objects. Avoidance policies and participant filters are examples of accessors being used to target values."),(0,a.kt)(i.Z,{data:{participantType:"INDIVIDUAL",person:{sex:"MALE"}},root:"participant",colorScheme:"summerfruit",invertTheme:!0,expandRoot:!0,expandToLevel:3,mdxType:"RenderJSON"}),(0,a.kt)("p",null,"In the ",(0,a.kt)("strong",{parentName:"p"},"Live Editor")," below, the accessor ",(0,a.kt)("inlineCode",{parentName:"p"},'"person.sex"')," is used to target ",(0,a.kt)("inlineCode",{parentName:"p"},"FEMALE")," participants.\nChange the accessor value in the ",(0,a.kt)("inlineCode",{parentName:"p"},"participantFilters")," to ",(0,a.kt)("inlineCode",{parentName:"p"},"MALE")," or uncomment the ",(0,a.kt)("inlineCode",{parentName:"p"},"person.nationalityCode"),"\nfilter to see the ",(0,a.kt)("strong",{parentName:"p"},"Participants Count")," change."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function AccessorsDemo(props) {\n  // Generate a tournament record with some MALE participants\n  const { tournamentRecord } = mocksEngine.generateTournamentRecord({\n    participantsProfile: { sex: 'MALE' },\n  });\n  tournamentEngine.setState(tournamentRecord);\n\n  // Now generate some FEMALE participants...\n  const { participants } = mocksEngine.generateParticipants({\n    participantsCount: 16,\n    sex: 'FEMALE',\n  });\n  // ... and add them to the tournament\n  tournamentEngine.addParticipants({ participants });\n\n  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(\n    {\n      participantFilters: {\n        accessorValues: [\n          { accessor: 'person.sex', value: 'FEMALE' },\n          // { accessor: 'person.nationalityCode', value: 'FRA' },\n        ],\n      },\n    }\n  );\n\n  return <Participants data={tournamentParticipants} />;\n}\n")))}d.isMDXComponent=!0}}]);