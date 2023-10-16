"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4406],{4006:(t,e,n)=>{n.d(e,{Z:()=>i});var a=n(4721),r=n(6096),o=n(959);const i=t=>{let{drawType:e,drawSize:n=8}=t;const i={seedsCount:4,drawType:e,drawSize:n};"AD_HOC"===e&&Object.assign(i,{automated:!0,roundsCount:3});const s=r.QO.generateTournamentRecord({drawProfiles:[i],completeAllMatchUps:!0,randomWinningSide:!0}),{tournamentRecord:l,eventIds:u}=s||{},p=u?.[0],{eventData:d}=r.M6.setState(l).getEventData({participantsProfile:{withIOC:!0,withISO2:!0},eventId:p})||{},c=d?.drawsData?.[0]?.structures||[],m=c[0]?.structureId,f=c?.find((t=>t.structureId===m)),N=f?.roundMatchUps,k=N?Object.values(N)?.flat():[],g=r.hC.randomMember(["Australian","Wimbledon","National","US Open","French","ITF"]),h=(0,a.K)({composition:a.Ex[g],matchUps:k});return o.createElement("div",{style:{zoom:.9}},o.createElement("div",{ref:t=>{for(;t?.firstChild;)t.removeChild(t.firstChild);t&&t.appendChild(h)}}))}},3588:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>p,contentTitle:()=>l,default:()=>f,frontMatter:()=>s,metadata:()=>u,toc:()=>d});var a=n(8957),r=(n(959),n(7942)),o=n(8090),i=n(4006);const s={title:"Draw Generation"},l=void 0,u={unversionedId:"concepts/draw-generation",id:"concepts/draw-generation",title:"Draw Generation",description:"Example",source:"@site/docs/concepts/draw-generation.mdx",sourceDirName:"concepts",slug:"/concepts/draw-generation",permalink:"/tods-competition-factory/docs/concepts/draw-generation",draft:!1,tags:[],version:"current",frontMatter:{title:"Draw Generation"},sidebar:"docs",previous:{title:"Context / Hydration",permalink:"/tods-competition-factory/docs/concepts/context"},next:{title:"Global State",permalink:"/tods-competition-factory/docs/concepts/globalState"}},p={},d=[{value:"Example",id:"example",level:2},{value:"Draw Types",id:"draw-types",level:2}],c={toc:d},m="wrapper";function f(t){let{components:e,...n}=t;return(0,r.kt)(m,(0,a.Z)({},c,n,{components:e,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"example"},"Example"),(0,r.kt)("p",null,"Themed visualization of draws by ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/CourtHive/courthive-components"},"courthive-components"),"."),(0,r.kt)(o.Z,{mdxType:"BrowserOnly"},(()=>(0,r.kt)(i.Z,{drawType:"COMPASS",drawSize:8,mdxType:"DrawType"}))),(0,r.kt)("h2",{id:"draw-types"},"Draw Types"),(0,r.kt)("p",null,"The convenience method ",(0,r.kt)("inlineCode",{parentName:"p"},"tournamentEngine.generateDrawDefinition()")," generates the following draw types:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"AD_HOC")," - An arbitrary number of matchUps may be added to an arbitrary number of rounds."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"COMPASS")," - Includes up to 8 structures; ensures participants a minimum of 3 matchUps."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"CURTIS")," - Includes 2 consolation structures, each fed by 2 main structure rounds, and a 3-4 playoff."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"DOUBLE_ELIMINATION")," - Main structure losers feed into consolation; consolation winner plays main structure winner."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP_TO_QF")," - Main structure losers feed into consolation through the Quarterfinals."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP_TO_R16")," - Main structure losers feed into consolation through the Round of 16."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP_TO_SF")," - Main structure losers feed into consolation through the Semifinals."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"FEED_IN_CHAMPIONSHIP")," - Main structure losers in every round feed into consolation."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"FEED_IN"),' - Also known as "staggered entry", participants feed into the main structure at specified rounds.'),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"FIRST_MATCH_LOSER_CONSOLATION")," - Losers feed into consolation whenever their first loss occurs."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"FIRST_ROUND_LOSER_CONSOLATION")," - Only first round losers feed into consolation structure."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"MODIFIED_FEED_IN_CHAMPIONSHIP")," - First and Second round losers are fed into consolation structure."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"OLYMPIC")," - Includes up to 4 structures; ensures participants a minimum of 2 matchUps."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"PLAY_OFF")," - All positions are played off; structures are added to ensure unique finishing positions."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"ROUND_ROBIN")," - Participants divided into specified group sizes."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"ROUND_ROBIN_WITH_PLAYOFF")," - Includes automated generation of specified playoff structures."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"SINGLE_ELIMINATION")," - Standard knockout draw structure.")),(0,r.kt)("admonition",{type:"note"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("strong",{parentName:"p"},"Additional Playoff Structures"),"\n",(0,r.kt)("inlineCode",{parentName:"p"},"getAvailablePlayoffProfiles()")," provides valid attributes for playoff structures generation.\n",(0,r.kt)("inlineCode",{parentName:"p"},"generateAndPopulatePlayoffStructures()")," generates playoff structures.\n",(0,r.kt)("inlineCode",{parentName:"p"},"attachPlayoffStructures()")," attaches playoff structures to target drawDefinition.\n",(0,r.kt)("inlineCode",{parentName:"p"},"addPlayoffStructures()")," combines generation and attachment of playoff structures."),(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("strong",{parentName:"p"},"Voluntary Consolation Structure"),"\n",(0,r.kt)("inlineCode",{parentName:"p"},"getEligibleVoluntaryConsolationParticipants()")," configurable method for determining eligibility.\n",(0,r.kt)("inlineCode",{parentName:"p"},"generateVoluntaryConsolation()")," generates matchUps for consolation structure.")))}f.isMDXComponent=!0}}]);