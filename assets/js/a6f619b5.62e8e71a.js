"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[8407],{7307:(e,t,n)=>{n.d(t,{Z:()=>h});var i=n(959),s=n(6096),a=n(1981);const o=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),r=(e,t,n)=>{let{style:i}=e;return{style:{...i,color:Number.isNaN(n[0])||parseInt(n,10)%2?i.color:"#33F"}}},d=(e,t,n)=>{let{style:i}=e;return{style:{...i,fontWeight:n?"bold":i.textTransform}}},l=(e,t)=>{let{style:n}=e;return{style:{...n,borderRadius:"Boolean"===t?3:n.borderRadius}}},p=(e,t,n)=>{const a="object"==typeof t,o=a&&Object.values(t)[0],r="string"==typeof o&&"{"===o[0];let d;if(a){const e=Object.keys(t);2!==s.hC.intersection(e,["drawId","drawType"]).length||e.includes("drawRepresentativeIds")||(d="drawDefinition"),2!==s.hC.intersection(e,["entryPosition","entryStatus"]).length||e.includes("entryStageSequence")||(d="entry"),3!==s.hC.intersection(e,["eventId","sortOrder","notBeforeTime"]).length||e.includes("tennisOfficialIds")?2!==s.hC.intersection(e,["eventId","eventName"]).length||e.includes("tennisOfficialIds")||(d="event"):d="round",2===s.hC.intersection(e,["flightNumber","drawId"]).length&&(d="flight"),2===s.hC.intersection(e,["name","value"]).length&&(d="extension"),2!==s.hC.intersection(e,["linkType","source"]).length||e.includes("linkCondition")||(d="link"),2!==s.hC.intersection(e,["matchUpId","drawPositions"]).length||e.includes("surfaceCategory")||(d="matchUp"),2===s.hC.intersection(e,["drawPosition","participantId","bye"]).length&&(d="positionAssignment"),2!==s.hC.intersection(e,["courtId","dateAvailability"]).length||e.includes("altitude")||(d="court"),2!==s.hC.intersection(e,["participantId","participantName"]).length||e.includes("onlineResources")||(d="participant"),2===s.hC.intersection(e,["structureId","structureName"]).length&&(d="structure"),2!==s.hC.intersection(e,["venueId","courts"]).length||e.includes("venueOtherIds")||(d="venue")}return i.createElement("span",null,d||(r?e:n))},u=e=>{return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?(e=>{try{const t=JSON.parse(JSON.parse(e)),n="true"===t.required?"":"? ",i="true"===t.array?"[]":"";return`${n}: ${["any","boolean","number","string"].includes(t.type)&&t.type||"object"===t.type&&t.object||"enum"===t.type?`enum ${t.enum}`:""}${i}${t.note?` \\\\ ${t.note}`:""}`}catch(t){return""}})(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},c=e=>{let[t]=e;return i.createElement("strong",null,t)},h=e=>{let{colorScheme:t="summerfruit",sortObjectKeys:n=!0,invertTheme:s=!0,expandRoot:h=!0,expandToLevel:m=1,hideRoot:g=!1,root:b="root",data:f}=e;return i.createElement("div",{style:{marginBottom:"1em"}},i.createElement(a.L,{theme:{valueLabel:r,nestedNodeLabel:d,extend:o[t],value:l},shouldExpandNode:(e,t,n)=>!!h&&(("object"!=typeof t||!t._typeDef)&&(n<m||void 0)),sortObjectKeys:n,getItemString:p,labelRenderer:c,valueRenderer:u,invertTheme:s,hideRoot:g,keyPath:[b],data:f}))}},2302:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>g,frontMatter:()=>d,metadata:()=>p,toc:()=>c});var i=n(8957),s=(n(959),n(7942)),a=n(7307);const o=JSON.parse('[{"seedNumber":1,"seedValue":"1","participantId":"772C5CA9-C092-418C-AC6F-A6B584BD2D37"},{"seedNumber":2,"seedValue":"2","participantId":"267BAA81-5A38-4AAF-9EA3-E434A1ED63AD"}]'),r=JSON.parse('{"policyName":"My Org Policy","drawSizeProgression":"true","duplicateSeedNumbers":"true","containerByesIgnoreSeeding":"true","seedingProfile":{"positioning":"CLUSTER"},"validSeedPositions":{"ignore":"true"},"seedsCountThresholds":[{"drawSize":4,"minimumParticipantCount":3,"seedsCount":2},{"drawSize":8,"minimumParticipantCount":5,"seedsCount":2},{"drawSize":16,"minimumParticipantCount":9,"seedsCount":4},{"drawSize":32,"minimumParticipantCount":17,"seedsCount":8},{"drawSize":64,"minimumParticipantCount":33,"seedsCount":16},{"drawSize":128,"minimumParticipantCount":65,"seedsCount":16},{"drawSize":128,"minimumParticipantCount":97,"seedsCount":32}]}'),d={title:"Positioning Seeds"},l=void 0,p={unversionedId:"policies/positioningSeeds",id:"policies/positioningSeeds",title:"Positioning Seeds",description:"A seeding policy specifies how many seeds to allow per draw size and how seeds are to be positioned within a draw structure;",source:"@site/docs/policies/positioningSeeds.mdx",sourceDirName:"policies",slug:"/policies/positioningSeeds",permalink:"/tods-competition-factory/docs/policies/positioningSeeds",draft:!1,tags:[],version:"current",frontMatter:{title:"Positioning Seeds"},sidebar:"docs",previous:{title:"Participant Policy",permalink:"/tods-competition-factory/docs/policies/participantPolicy"},next:{title:"Scheduling Policy",permalink:"/tods-competition-factory/docs/policies/scheduling"}},u={},c=[{value:"seedingProfile",id:"seedingprofile",level:2},{value:"Seed Blocks",id:"seed-blocks",level:3},{value:"seedCountThresholds and drawSizeProgression",id:"seedcountthresholds-and-drawsizeprogression",level:2},{value:"duplicateSeedNumbers",id:"duplicateseednumbers",level:2},{value:"Seed Assignments",id:"seed-assignments",level:2}],h={toc:c},m="wrapper";function g(e){let{components:t,...n}=e;return(0,s.kt)(m,(0,i.Z)({},h,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"A ",(0,s.kt)("strong",{parentName:"p"},"seeding policy")," specifies how many seeds to allow per draw size and how seeds are to be positioned within a draw structure;\nit may also instruct the ",(0,s.kt)("inlineCode",{parentName:"p"},"drawEngine")," to disallow the placement of seed numbers in positions which are not defined as seeded positions,\nas well as indicate that duplicate seed numbers may be used."),(0,s.kt)(a.Z,{data:r,root:"seeding",colorScheme:"summerfruit",invertTheme:!0,expandToLevel:1,mdxType:"RenderJSON"}),(0,s.kt)("h2",{id:"seedingprofile"},"seedingProfile"),(0,s.kt)("p",null,"There are two ",(0,s.kt)("strong",{parentName:"p"},"seedingProfile")," patterns supported by the ",(0,s.kt)("inlineCode",{parentName:"p"},"drawEngine"),' for elimination structures: "CLUSTER" and "SEPARATE".\n',(0,s.kt)("inlineCode",{parentName:"p"},"seedingProfile.positioning")," determines which draw positions appear in ",(0,s.kt)("strong",{parentName:"p"},"seedBlocks"),"."),(0,s.kt)("p",null,'"CLUSTER" indicates the positioning used by the ',(0,s.kt)("strong",{parentName:"p"},"ITF"),', while "SEPARATE" indicates the positioning used by the ',(0,s.kt)("strong",{parentName:"p"},"USTA"),"."),(0,s.kt)("p",null,"In ",(0,s.kt)("strong",{parentName:"p"},"ITF")," draws, seeded posiitions can appear next to each other (though the positions are part\nof different eights, for instance). In ",(0,s.kt)("strong",{parentName:"p"},"USTA")," draws there is always an even separation, with seeded positions in\nthe top half of of a draw at the top of position groups, and seeded positions in the bottom half of a draw\nat the bottom of position groups."),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"seedingProfile.groupSeedingThreshold")," will set seedValue to lowest value within all groups where seedNumber is > threshold"),(0,s.kt)("h3",{id:"seed-blocks"},"Seed Blocks"),(0,s.kt)("p",null,"A Seed Block is a grouping of positions used for placement of seeded participants.\nFor a typical ",(0,s.kt)("strong",{parentName:"p"},"ITF")," elimination structure with a draw size of 32, the seed blocks follow the pattern:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-js"},"[1], [32], [9, 24], [8, 16, 17, 25], ...\n")),(0,s.kt)("p",null,"The first and second seeds are always in their own seed block, which means participants with these seed assignments have fixed positions.\nThe third and fourth seeds are in a seed block together; the positions within the block are assigned at random to the seeded participants.\nThe fifth through eighth seeds have a block of four possible positions, and so forth."),(0,s.kt)("h2",{id:"seedcountthresholds-and-drawsizeprogression"},"seedCountThresholds and drawSizeProgression"),(0,s.kt)("p",null,"Objects in the ",(0,s.kt)("inlineCode",{parentName:"p"},"seedCountThresholds")," array determine ",(0,s.kt)("inlineCode",{parentName:"p"},"seedsCount"),", the number of seeds which are allowed for each ",(0,s.kt)("inlineCode",{parentName:"p"},"drawSize"),", by defining a ",(0,s.kt)("inlineCode",{parentName:"p"},"minimumParticpantCount"),"."),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},"When ",(0,s.kt)("inlineCode",{parentName:"li"},"drawSizeProgression")," is ",(0,s.kt)("strong",{parentName:"li"},"true"),", thresholds for smaller drawSizes are applied to larger drawSizes."),(0,s.kt)("li",{parentName:"ul"},"When ",(0,s.kt)("inlineCode",{parentName:"li"},"drawSizeProgression")," is ",(0,s.kt)("strong",{parentName:"li"},"false")," it is possible to have more granular control of the policy for each ",(0,s.kt)("inlineCode",{parentName:"li"},"drawSize"),".")),(0,s.kt)("h2",{id:"duplicateseednumbers"},"duplicateSeedNumbers"),(0,s.kt)("p",null,"Some providers prefer for participants in a ",(0,s.kt)("strong",{parentName:"p"},"seedBlock")," such as ","[5, 6, 7, 8]"," to all appear with the same ",(0,s.kt)("strong",{parentName:"p"},"seedValue"),".\nThis implies that even though ",(0,s.kt)("inlineCode",{parentName:"p"},"seedNumbers")," may be assigned by ",(0,s.kt)("strong",{parentName:"p"},"ranking")," or ",(0,s.kt)("strong",{parentName:"p"},"rating"),", participants within a ",(0,s.kt)("strong",{parentName:"p"},"seedBlock")," should be considered equal."),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"{ duplicateSeedNumbers: true }")," allows auto seeding methods to randomly select the order in which participants in a ",(0,s.kt)("strong",{parentName:"p"},"seedBlock")," are placed.\nFor standard Elimination structures this is meaningless, but in Round Robin and Staggered Entry structures particpant placments can vary."),(0,s.kt)("h2",{id:"seed-assignments"},"Seed Assignments"),(0,s.kt)("p",null,"Every draw structure uses ",(0,s.kt)("inlineCode",{parentName:"p"},"seedAssignments")," to associate unique ",(0,s.kt)("inlineCode",{parentName:"p"},"participantIds")," with unique ",(0,s.kt)("inlineCode",{parentName:"p"},"seedNumbers"),"."),(0,s.kt)("admonition",{type:"note"},(0,s.kt)("p",{parentName:"admonition"},"Only one ",(0,s.kt)("inlineCode",{parentName:"p"},"participantId")," may be assigned to each ",(0,s.kt)("inlineCode",{parentName:"p"},"seedNumber"),", but each seed assignment may have a custom ",(0,s.kt)("inlineCode",{parentName:"p"},"seedValue"),". This supports\nscenarios where the fifth throught the eighth seeds appear with a value of ",(0,s.kt)("strong",{parentName:"p"},"'5-8'"),"; some providers even choose\nto display numerous participants with the same seed number on a draw... if five particpants have equivalent rankings they could all appear\nas seed ",(0,s.kt)("strong",{parentName:"p"},'"4"'),", even though one of those five would get a position from the 3-4 seedblock and four of the five would be assigned\npositions from the 5-8 seed block.")),(0,s.kt)(a.Z,{data:o,root:"seedAssignments",colorScheme:"summerfruit",invertTheme:!0,expandToLevel:3,mdxType:"RenderJSON"}))}g.isMDXComponent=!0}}]);