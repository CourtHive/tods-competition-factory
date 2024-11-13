"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[6947],{3805:(e,t,n)=>{n.d(t,{xA:()=>l,yg:()=>y});var r=n(758);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},l=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),d=s(n),u=o,y=d["".concat(p,".").concat(u)]||d[u]||m[u]||a;return n?r.createElement(y,i(i({ref:t},l),{},{components:n})):r.createElement(y,i({ref:t},l))}));function y(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=u;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[d]="string"==typeof e?e:o,i[1]=c;for(var s=2;s<a;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},8518:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>m,frontMatter:()=>a,metadata:()=>c,toc:()=>s});var r=n(2232),o=(n(758),n(3805));const a={title:"Context / Hydration"},i=void 0,c={unversionedId:"concepts/matchup-context",id:"concepts/matchup-context",title:"Context / Hydration",description:"MatchUps can be returned with contextual information that is not part of the TODS document node from which they originated.",source:"@site/docs/concepts/matchup-context.mdx",sourceDirName:"concepts",slug:"/concepts/matchup-context",permalink:"/tods-competition-factory/docs/concepts/matchup-context",draft:!1,tags:[],version:"current",frontMatter:{title:"Context / Hydration"},sidebar:"docs",previous:{title:"Overview",permalink:"/tods-competition-factory/docs/concepts/matchup-overview"},next:{title:"matchUp filtering",permalink:"/tods-competition-factory/docs/concepts/matchup-filtering"}},p={},s=[{value:"matchUps",id:"matchups",level:2}],l={toc:s},d="wrapper";function m(e){let{components:t,...n}=e;return(0,o.yg)(d,(0,r.A)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,o.yg)("p",null,(0,o.yg)("strong",{parentName:"p"},"MatchUps"),' can be returned with contextual information that is not part of the TODS document node from which they originated.\nThe process of adding context is also referred to as "hydration".'),(0,o.yg)("p",null,"Contextual information for ",(0,o.yg)("inlineCode",{parentName:"p"},"matchUps")," includes information about the ",(0,o.yg)("inlineCode",{parentName:"p"},"structures, drawDefinitions")," and ",(0,o.yg)("inlineCode",{parentName:"p"},"events")," within which they are embeded;\n",(0,o.yg)("inlineCode",{parentName:"p"},"drawPositions")," are resolved using ",(0,o.yg)("inlineCode",{parentName:"p"},"positionAssignments")," to the ",(0,o.yg)("inlineCode",{parentName:"p"},"participants"),"."),(0,o.yg)("p",null,"Additional contextual information can be passed into methods for retrieving ",(0,o.yg)("inlineCode",{parentName:"p"},"matchUps")," via the ",(0,o.yg)("inlineCode",{parentName:"p"},"context")," attribute,\nand any ",(0,o.yg)("inlineCode",{parentName:"p"},"extensions")," can be converted to attributes accessible as attributes beginning with an underscore."),(0,o.yg)("h2",{id:"matchups"},"matchUps"),(0,o.yg)("p",null,"All API calls which return ",(0,o.yg)("strong",{parentName:"p"},"matchUps")," return deep copies with context.\nAttributes that are added for ",(0,o.yg)("strong",{parentName:"p"},"matchUps")," include: ",(0,o.yg)("inlineCode",{parentName:"p"},"structureId, structureName, drawId, eventId, eventName, tournamentId")," and ",(0,o.yg)("inlineCode",{parentName:"p"},"tournamentName"),"."),(0,o.yg)("p",null,"All ",(0,o.yg)("inlineCode",{parentName:"p"},"matchUps")," that are returned ",(0,o.yg)("strong",{parentName:"p"},"inContext")," include converted extensions. See ",(0,o.yg)("strong",{parentName:"p"},"makeDeepCopy")," in ",(0,o.yg)("a",{parentName:"p",href:"../tools/make-deep-copy"},"Tools"),"."),(0,o.yg)("p",null,"In the ",(0,o.yg)("strong",{parentName:"p"},"Live Editor")," example below, ",(0,o.yg)("inlineCode",{parentName:"p"},"{ inContext: false }")," overrides the default behavior.\nChange the value to ",(0,o.yg)("inlineCode",{parentName:"p"},"true")," and compare the ",(0,o.yg)("inlineCode",{parentName:"p"},"matchUp")," objects to see the difference when context is added."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function ContextDemo(props) {\n  const { tournamentRecord } = mocksEngine.generateTournamentRecord({\n    drawProfiles: [{ drawSize: 4 }],\n  });\n  tournamentEngine.setState(tournamentRecord);\n\n  const { matchUps } = tournamentEngine.allTournamentMatchUps({\n    inContext: false,\n  });\n\n  return <MatchUps data={matchUps} />;\n}\n")))}m.isMDXComponent=!0}}]);