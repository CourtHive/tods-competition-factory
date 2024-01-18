"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[937],{4006:(e,t,n)=>{n.d(t,{Z:()=>o});var a=n(2579),s=n(4434),r=n(959);const o=e=>{let{drawType:t,drawSize:n=8}=e;const o={seedsCount:4,drawType:t,drawSize:n};"AD_HOC"===t&&Object.assign(o,{automated:!0,roundsCount:3});const i=s.QO.generateTournamentRecord({drawProfiles:[o],completeAllMatchUps:!0,randomWinningSide:!0}),{tournamentRecord:l,eventIds:d}=i||{},c=d?.[0],{eventData:u}=s.M6.setState(l).getEventData({participantsProfile:{withIOC:!0,withISO2:!0},eventId:c})||{},m=u?.drawsData?.[0]?.structures||[],p=m[0]?.structureId,h=m?.find((e=>e.structureId===p)),g=h?.roundMatchUps,f=g?Object.values(g)?.flat():[],v=s.rj.randomMember(["Australian","Wimbledon","National","US Open","French","ITF"]),k=(0,a.K)({composition:a.Ex[v],matchUps:f});return r.createElement("div",{style:{zoom:.9}},r.createElement("div",{ref:e=>{for(;e?.firstChild;)e.removeChild(e.firstChild);e&&e.appendChild(k)}}))}},8221:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>h,frontMatter:()=>i,metadata:()=>d,toc:()=>u});var a=n(8957),s=(n(959),n(7942)),r=n(8090),o=n(4006);const i={title:"Introduction",slug:"/"},l=void 0,d={unversionedId:"introduction",id:"introduction",title:"Introduction",description:"Tournament Business Rules",source:"@site/docs/introduction.mdx",sourceDirName:".",slug:"/",permalink:"/tods-competition-factory/docs/",draft:!1,tags:[],version:"current",frontMatter:{title:"Introduction",slug:"/"},sidebar:"docs",next:{title:"TMX Example",permalink:"/tods-competition-factory/docs/tmx"}},c={},u=[{value:"Tournament Business Rules",id:"tournament-business-rules",level:2},{value:"State Engines",id:"state-engines",level:2},{value:"Data Standards",id:"data-standards",level:2},{value:"Time Capsule",id:"time-capsule",level:2},{value:"Interactive Examples",id:"interactive-examples",level:2}],m={toc:u},p="wrapper";function h(e){let{components:t,...n}=e;return(0,s.kt)(p,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h2",{id:"tournament-business-rules"},"Tournament Business Rules"),(0,s.kt)("p",null,"The ",(0,s.kt)("strong",{parentName:"p"},"Competition Factory"),' is a collection of functions for transforming/mutating tournament records and is intended to ensure the integrity of Tournaments by managing all state transformations.\nFactory functions embody the "business rules" required by Tournament Management Solutions, and enable an entirely new way of constructing software to manage tournaments.'),(0,s.kt)("p",null,"The rules governing the creation of draws, seeding, and participant movement can be present on a standalone client, on a server, or both.\nAn entire tournament management solution ",(0,s.kt)("a",{parentName:"p",href:"https://courthive.github.io/TMX"},"can run in a browser"),", or a client can communicate with a server which utilizes a database, or simply the file system.\nServer deployments support highly scaleable asynchronous processing models in ",(0,s.kt)("strong",{parentName:"p"},"Node.js"),"."),(0,s.kt)(r.Z,{mdxType:"BrowserOnly"},(()=>(0,s.kt)(o.Z,{drawSize:4,mdxType:"DrawType"}))),(0,s.kt)("h2",{id:"state-engines"},"State Engines"),(0,s.kt)("p",null,"The ",(0,s.kt)("strong",{parentName:"p"},"Competition Factory"),' includes synchronous and asynchronous "state engines" which provide services for managing the state of a tournament record as well as subscriptions, notifications and logging.'),(0,s.kt)("h2",{id:"data-standards"},"Data Standards"),(0,s.kt)("p",null,"The ",(0,s.kt)("strong",{parentName:"p"},"Competition Factory")," utilizes the ",(0,s.kt)("strong",{parentName:"p"},(0,s.kt)("a",{parentName:"strong",href:"https://itftennis.atlassian.net/wiki/spaces/TODS/overview"},"Tennis Open Data Standards")),", ",(0,s.kt)("strong",{parentName:"p"},"(TODS)"),",\nwhich provide a document-based representation of all of the elements of a tournament including participants, events, draws, matchUps, contacts, and references to online resources.\nAlthough the data standard is emerging in the sport of Tennis, ",(0,s.kt)("strong",{parentName:"p"},(0,s.kt)("em",{parentName:"strong"},"the data structures apply to tournaments in many sports")),"."),(0,s.kt)("h2",{id:"time-capsule"},"Time Capsule"),(0,s.kt)("p",null,"After a tournament has been completed, a ",(0,s.kt)("strong",{parentName:"p"},"TODS"),' file can be considered a "time capsule" of all the information related to the constructrion and management of a tournament.\nThis means that complete historical data is available in one cross-platform, database-independent JSON file, removing all concerns about keeping software maintenance contracts active in order to retain access to data,\nas well as any reliance on applications which interpret database schemas.'),(0,s.kt)("h2",{id:"interactive-examples"},"Interactive Examples"),(0,s.kt)("admonition",{type:"tip"},(0,s.kt)("p",{parentName:"admonition"},"This documentation includes Live Code Editors to enable direct interaction with the APIs.")),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function GiveThanks(props) {\n  const thanks = tournamentEngine.credits();\n\n  return <pre>{thanks}</pre>;\n}\n")))}h.isMDXComponent=!0}}]);