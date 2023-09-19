"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2267],{7307:(e,t,n)=>{n.d(t,{Z:()=>m});var a=n(959),s=n(2506),o=n(3758);const r=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),i=(e,t,n)=>{let{style:a}=e;return{style:{...a,color:Number.isNaN(n[0])||parseInt(n,10)%2?a.color:"#33F"}}},c=(e,t,n)=>{let{style:a}=e;return{style:{...a,fontWeight:n?"bold":a.textTransform}}},l=(e,t)=>{let{style:n}=e;return{style:{...n,borderRadius:"Boolean"===t?3:n.borderRadius}}},p=(e,t,n)=>{const o="object"==typeof t,r=o&&Object.values(t)[0],i="string"==typeof r&&"{"===r[0];let c;if(o){const e=Object.keys(t);2!==s.hC.intersection(e,["drawId","drawType"]).length||e.includes("drawRepresentativeIds")||(c="drawDefinition"),2!==s.hC.intersection(e,["entryPosition","entryStatus"]).length||e.includes("entryStageSequence")||(c="entry"),3!==s.hC.intersection(e,["eventId","sortOrder","notBeforeTime"]).length||e.includes("tennisOfficialIds")?2!==s.hC.intersection(e,["eventId","eventName"]).length||e.includes("tennisOfficialIds")||(c="event"):c="round",2===s.hC.intersection(e,["flightNumber","drawId"]).length&&(c="flight"),2===s.hC.intersection(e,["name","value"]).length&&(c="extension"),2!==s.hC.intersection(e,["linkType","source"]).length||e.includes("linkCondition")||(c="link"),2!==s.hC.intersection(e,["matchUpId","drawPositions"]).length||e.includes("surfaceCategory")||(c="matchUp"),2===s.hC.intersection(e,["drawPosition","participantId","bye"]).length&&(c="positionAssignment"),2!==s.hC.intersection(e,["courtId","dateAvailability"]).length||e.includes("altitude")||(c="court"),2!==s.hC.intersection(e,["participantId","participantName"]).length||e.includes("onlineResources")||(c="participant"),2===s.hC.intersection(e,["structureId","structureName"]).length&&(c="structure"),2!==s.hC.intersection(e,["venueId","courts"]).length||e.includes("venueOtherIds")||(c="venue")}return a.createElement("span",null,c||(i?e:n))},d=e=>{return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?(e=>{try{const t=JSON.parse(JSON.parse(e)),n="true"===t.required?"":"? ",a="true"===t.array?"[]":"";return`${n}: ${["any","boolean","number","string"].includes(t.type)&&t.type||"object"===t.type&&t.object||"enum"===t.type?`enum ${t.enum}`:""}${a}${t.note?` \\\\ ${t.note}`:""}`}catch(t){return""}})(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},u=e=>{let[t]=e;return a.createElement("strong",null,t)},m=e=>{let{colorScheme:t="summerfruit",sortObjectKeys:n=!0,invertTheme:s=!0,expandRoot:m=!0,expandToLevel:b=1,hideRoot:h=!1,root:f="root",data:g}=e;return a.createElement("div",{style:{marginBottom:"1em"}},a.createElement(o.L,{theme:{valueLabel:i,nestedNodeLabel:c,extend:r[t],value:l},shouldExpandNode:(e,t,n)=>!!m&&(("object"!=typeof t||!t._typeDef)&&(n<b||void 0)),sortObjectKeys:n,getItemString:p,labelRenderer:u,valueRenderer:d,invertTheme:s,hideRoot:h,keyPath:[f],data:g}))}},4278:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>m,frontMatter:()=>r,metadata:()=>c,toc:()=>p});var a=n(8957),s=(n(959),n(7942)),o=n(7307);const r={title:"Accessors"},i=void 0,c={unversionedId:"concepts/accessors",id:"concepts/accessors",title:"Accessors",description:"Accessors are used to specify the location of data values in JSON objects. Avoidance policies and participant filters are examples of accessors being used to target values.",source:"@site/docs/concepts/accessors.mdx",sourceDirName:"concepts",slug:"/concepts/accessors",permalink:"/tods-competition-factory/docs/concepts/accessors",draft:!1,tags:[],version:"current",frontMatter:{title:"Accessors"},sidebar:"docs",previous:{title:"Actions",permalink:"/tods-competition-factory/docs/concepts/actions"},next:{title:"Context / Hydration",permalink:"/tods-competition-factory/docs/concepts/context"}},l={},p=[],d={toc:p},u="wrapper";function m(e){let{components:t,...n}=e;return(0,s.kt)(u,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"Accessors are used to specify the location of data values in JSON objects. Avoidance policies and participant filters are examples of accessors being used to target values."),(0,s.kt)(o.Z,{data:{participantType:"INDIVIDUAL",person:{sex:"MALE"}},root:"participant",colorScheme:"summerfruit",invertTheme:!0,expandRoot:!0,expandToLevel:3,mdxType:"RenderJSON"}),(0,s.kt)("p",null,"In the ",(0,s.kt)("strong",{parentName:"p"},"Live Editor")," below, the accessor ",(0,s.kt)("inlineCode",{parentName:"p"},'"person.sex"')," is used to target ",(0,s.kt)("inlineCode",{parentName:"p"},"FEMALE")," participants.\nChange the accessor value in the ",(0,s.kt)("inlineCode",{parentName:"p"},"participantFilters")," to ",(0,s.kt)("inlineCode",{parentName:"p"},"MALE")," or uncomment the ",(0,s.kt)("inlineCode",{parentName:"p"},"person.nationalityCode"),"\nfilter to see the ",(0,s.kt)("strong",{parentName:"p"},"Participants Count")," change."),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function AccessorsDemo(props) {\n  // Generate a tournament record with some MALE participants\n  const { tournamentRecord } = mocksEngine.generateTournamentRecord({\n    participantsProfile: { sex: 'MALE' },\n  });\n  tournamentEngine.setState(tournamentRecord);\n\n  // Now generate some FEMALE participants...\n  const { participants } = mocksEngine.generateParticipants({\n    participantsCount: 16,\n    sex: 'FEMALE',\n  });\n  // ... and add them to the tournament\n  tournamentEngine.addParticipants({ participants });\n\n  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(\n    {\n      participantFilters: {\n        accessorValues: [\n          { accessor: 'person.sex', value: 'FEMALE' },\n          // { accessor: 'person.nationalityCode', value: 'FRA' },\n        ],\n      },\n    }\n  );\n\n  return <Participants data={tournamentParticipants} />;\n}\n")))}m.isMDXComponent=!0}}]);