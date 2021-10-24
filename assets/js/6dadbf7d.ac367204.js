(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2267],{7018:function(e,t,n){"use strict";n.d(t,{Z:function(){return m}});var a=n(7294),s=n(5753),o=n(126),r=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),i=function(e,t,n){var a=e.style;return{style:Object.assign({},a,{color:Number.isNaN(n[0])||parseInt(n,10)%2?a.color:"#33F"})}},c=function(e,t,n){var a=e.style;return{style:Object.assign({},a,{fontWeight:n?"bold":a.textTransform})}},p=function(e,t){var n=e.style;return{style:Object.assign({},n,{borderRadius:"Boolean"===t?3:n.borderRadius})}},u=function(e,t,n){var o,r="object"==typeof t,i=r&&Object.values(t)[0],c="string"==typeof i&&"{"===i[0];if(r){var p=Object.keys(t);2===s.hC.intersection(p,["drawId","drawType"]).length&&(o="drawDefinition"),2===s.hC.intersection(p,["entryPosition","entryStatus"]).length&&(o="entry"),2===s.hC.intersection(p,["eventId","eventName"]).length&&(o="event"),2===s.hC.intersection(p,["flightNumber","drawId"]).length&&(o="flight"),2===s.hC.intersection(p,["name","value"]).length&&(o="extension"),2===s.hC.intersection(p,["linkType","source"]).length&&(o="link"),2===s.hC.intersection(p,["matchUpId","drawPositions"]).length&&(o="matchUp"),2===s.hC.intersection(p,["drawPosition","participantId","bye"]).length&&(o="positionAssignment"),2===s.hC.intersection(p,["participantId","participantName"]).length&&(o="participant"),2===s.hC.intersection(p,["structureId","structureName"]).length&&(o="structure"),2===s.hC.intersection(p,["venueId","courts"]).length&&(o="venue")}return a.createElement("span",null,o||(c?e:n))},d=function(e){return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?function(e){try{var t=JSON.parse(JSON.parse(e)),n="true"===t.required?"":"? ",a="true"===t.array?"[]":"";return n+": "+(["string","number","boolean"].includes(t.type)?t.type:"object"===t.type?t.object||"Object":"enum"===t.type?"enum "+t.enum:"")+a+(t.note?" \\\\ "+t.note:"")}catch(s){return""}}(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},l=function(e){var t=e[0];return a.createElement("strong",null,t)},m=function(e){var t=e.colorScheme,n=void 0===t?"summerfruit":t,s=e.sortObjectKeys,m=void 0===s||s,b=e.invertTheme,f=void 0===b||b,h=e.expandRoot,g=void 0===h||h,v=e.expandToLevel,y=void 0===v?1:v,E=e.hideRoot,k=void 0!==E&&E,C=e.root,A=void 0===C?"root":C,N=e.data;return a.createElement("div",{style:{marginBottom:"1em"}},a.createElement(o.ZP,{theme:{valueLabel:i,nestedNodeLabel:c,extend:r[n],value:p},shouldExpandNode:function(e,t,n){return!!g&&(("object"!=typeof t||!t._typeDef)&&(n<y||void 0))},sortObjectKeys:m,getItemString:u,labelRenderer:l,valueRenderer:d,invertTheme:f,hideRoot:k,keyPath:[A],data:N}))}},2042:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return c},metadata:function(){return p},toc:function(){return u},default:function(){return l}});var a=n(2122),s=n(9756),o=(n(7294),n(3905)),r=n(7018),i=["components"],c={title:"Accessors"},p={unversionedId:"concepts/accessors",id:"concepts/accessors",isDocsHomePage:!1,title:"Accessors",description:"Accessors are used to specify the location of data values in JSON objects. Avoidance policies and participant filters are examples of accessors being used to target values.",source:"@site/docs/concepts/accessors.mdx",sourceDirName:"concepts",slug:"/concepts/accessors",permalink:"/tods-competition-factory/docs/concepts/accessors",version:"current",frontMatter:{title:"Accessors"},sidebar:"docs",previous:{title:"Actions",permalink:"/tods-competition-factory/docs/concepts/actions"},next:{title:"Context",permalink:"/tods-competition-factory/docs/concepts/context"}},u=[],d={toc:u};function l(e){var t=e.components,n=(0,s.Z)(e,i);return(0,o.kt)("wrapper",(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Accessors are used to specify the location of data values in JSON objects. Avoidance policies and participant filters are examples of accessors being used to target values."),(0,o.kt)(r.Z,{data:{participantType:"INDIVIDUAL",person:{sex:"MALE"}},root:"participant",colorScheme:"summerfruit",invertTheme:!0,expandRoot:!0,expandToLevel:3,mdxType:"RenderJSON"}),(0,o.kt)("p",null,"In the ",(0,o.kt)("strong",{parentName:"p"},"Live Editor")," below, the accessor ",(0,o.kt)("inlineCode",{parentName:"p"},'"person.sex"')," is used to target ",(0,o.kt)("inlineCode",{parentName:"p"},"FEMALE")," participants.\nChange the accessor value in the ",(0,o.kt)("inlineCode",{parentName:"p"},"participantFilters")," to ",(0,o.kt)("inlineCode",{parentName:"p"},"MALE")," or uncomment the ",(0,o.kt)("inlineCode",{parentName:"p"},"person.nationalityCode"),"\nfilter to see the ",(0,o.kt)("strong",{parentName:"p"},"Participants Count")," change."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function AccessorsDemo(props) {\n  // Generate a tournament record with some MALE participants\n  const { tournamentRecord } = mocksEngine.generateTournamentRecord({\n    participantsProfile: { sex: 'MALE' },\n  });\n  tournamentEngine.setState(tournamentRecord);\n\n  // Now generate some FEMALE participants...\n  const { participants } = mocksEngine.generateParticipants({\n    participantsCount: 16,\n    sex: 'FEMALE',\n  });\n  // ... and add them to the tournament\n  tournamentEngine.addParticipants({ participants });\n\n  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(\n    {\n      participantFilters: {\n        accessorValues: [\n          { accessor: 'person.sex', value: 'FEMALE' },\n          // { accessor: 'person.nationalityCode', value: 'FRA' },\n        ],\n      },\n    }\n  );\n\n  return <Participants data={tournamentParticipants} />;\n}\n")))}l.isMDXComponent=!0}}]);