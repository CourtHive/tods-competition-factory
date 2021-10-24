(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[5964],{7018:function(e,t,n){"use strict";n.d(t,{Z:function(){return b}});var o=n(7294),i=n(5753),s=n(126),a=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),r=function(e,t,n){var o=e.style;return{style:Object.assign({},o,{color:Number.isNaN(n[0])||parseInt(n,10)%2?o.color:"#33F"})}},c=function(e,t,n){var o=e.style;return{style:Object.assign({},o,{fontWeight:n?"bold":o.textTransform})}},l=function(e,t){var n=e.style;return{style:Object.assign({},n,{borderRadius:"Boolean"===t?3:n.borderRadius})}},p=function(e,t,n){var s,a="object"==typeof t,r=a&&Object.values(t)[0],c="string"==typeof r&&"{"===r[0];if(a){var l=Object.keys(t);2===i.hC.intersection(l,["drawId","drawType"]).length&&(s="drawDefinition"),2===i.hC.intersection(l,["entryPosition","entryStatus"]).length&&(s="entry"),2===i.hC.intersection(l,["eventId","eventName"]).length&&(s="event"),2===i.hC.intersection(l,["flightNumber","drawId"]).length&&(s="flight"),2===i.hC.intersection(l,["name","value"]).length&&(s="extension"),2===i.hC.intersection(l,["linkType","source"]).length&&(s="link"),2===i.hC.intersection(l,["matchUpId","drawPositions"]).length&&(s="matchUp"),2===i.hC.intersection(l,["drawPosition","participantId","bye"]).length&&(s="positionAssignment"),2===i.hC.intersection(l,["participantId","participantName"]).length&&(s="participant"),2===i.hC.intersection(l,["structureId","structureName"]).length&&(s="structure"),2===i.hC.intersection(l,["venueId","courts"]).length&&(s="venue")}return o.createElement("span",null,s||(c?e:n))},d=function(e){return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?function(e){try{var t=JSON.parse(JSON.parse(e)),n="true"===t.required?"":"? ",o="true"===t.array?"[]":"";return n+": "+(["string","number","boolean"].includes(t.type)?t.type:"object"===t.type?t.object||"Object":"enum"===t.type?"enum "+t.enum:"")+o+(t.note?" \\\\ "+t.note:"")}catch(i){return""}}(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},u=function(e){var t=e[0];return o.createElement("strong",null,t)},b=function(e){var t=e.colorScheme,n=void 0===t?"summerfruit":t,i=e.sortObjectKeys,b=void 0===i||i,m=e.invertTheme,f=void 0===m||m,h=e.expandRoot,y=void 0===h||h,v=e.expandToLevel,g=void 0===v?1:v,A=e.hideRoot,N=void 0!==A&&A,k=e.root,D=void 0===k?"root":k,C=e.data;return o.createElement("div",{style:{marginBottom:"1em"}},o.createElement(s.ZP,{theme:{valueLabel:r,nestedNodeLabel:c,extend:a[n],value:l},shouldExpandNode:function(e,t,n){return!!y&&(("object"!=typeof t||!t._typeDef)&&(n<g||void 0))},sortObjectKeys:b,getItemString:p,labelRenderer:u,valueRenderer:d,invertTheme:f,hideRoot:N,keyPath:[D],data:C}))}},6787:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return b},frontMatter:function(){return l},metadata:function(){return p},toc:function(){return d}});var o=n(2122),i=n(9756),s=(n(7294),n(3905)),a=n(7018),r=JSON.parse('{"positionActions":{"policyName":"positionActionsDefault","enabledStructures":[{"stages":["QUALIFYING","MAIN"],"stageSequences":[1],"enabledActions":[],"disabledActions":[]},{"stages":[],"stageSequences":[],"enabledActions":["SEED_VALUE","ADD_NICKNAME","ADD_PENALTY"],"disabledActions":[]}],"disbledStructures":[],"otherFlightEntries":false}}'),c=["components"],l={title:"Position Actions"},p={unversionedId:"policies/positionActions",id:"policies/positionActions",isDocsHomePage:!1,title:"Position Actions",description:"See Actions for context.",source:"@site/docs/policies/positionActions.mdx",sourceDirName:"policies",slug:"/policies/positionActions",permalink:"/tods-competition-factory/docs/policies/positionActions",version:"current",frontMatter:{title:"Position Actions"},sidebar:"docs",previous:{title:"Accessors",permalink:"/tods-competition-factory/docs/policies/accessors"},next:{title:"Positioning Seeds",permalink:"/tods-competition-factory/docs/policies/positioningSeeds"}},d=[{value:"policyDefinitions Example",id:"policydefinitions-example",children:[]}],u={toc:d};function b(e){var t=e.components,n=(0,i.Z)(e,c);return(0,s.kt)("wrapper",(0,o.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"See ",(0,s.kt)("a",{parentName:"p",href:"/docs/concepts/actions"},"Actions")," for context."),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"positionActions")," returns an array of valid actions for a specified drawPosition. Valid actions can be determined, in part, by\n",(0,s.kt)("inlineCode",{parentName:"p"},"policyDefinitions"),". In the Competition Factory source there are four examples of position action policies:"),(0,s.kt)("ol",null,(0,s.kt)("li",{parentName:"ol"},"Default position actions"),(0,s.kt)("li",{parentName:"ol"},"No movement (disallows swapping participants & etc.)"),(0,s.kt)("li",{parentName:"ol"},"Disabled position actions"),(0,s.kt)("li",{parentName:"ol"},"Unrestricted position actions (all available actions)")),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-js"},"const { positionActions } = tournamentEngine.positionActions({\n  policyDefinitions, // optional - can be attached to tournamentRecord, event, or draw\n  drawPosition,\n  eventId,\n  drawId,\n});\n")),(0,s.kt)("h3",{id:"policydefinitions-example"},"policyDefinitions Example"),(0,s.kt)(a.Z,{data:r,root:"policyDefinitions",colorScheme:"summerfruit",invertTheme:!0,expandToLevel:1,mdxType:"RenderJSON"}))}b.isMDXComponent=!0}}]);