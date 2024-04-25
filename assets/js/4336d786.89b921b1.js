"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4004],{6034:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>g});var a=n(1258);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=a.createContext({}),p=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return a.createElement(l.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),u=p(n),m=i,g=u["".concat(l,".").concat(m)]||u[m]||d[m]||r;return n?a.createElement(g,o(o({ref:t},c),{},{components:n})):a.createElement(g,o({ref:t},c))}));function g(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:i,o[1]=s;for(var p=2;p<r;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},2054:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>r,metadata:()=>s,toc:()=>p});var a=n(8957),i=(n(1258),n(6034));const r={title:"State Engines"},o=void 0,s={unversionedId:"engines/state-engines",id:"engines/state-engines",title:"State Engines",description:"Competition Factory engines share a state which contains one or more tournamentRecords and any factory functions which have been imported from Governors.",source:"@site/docs/engines/state-engines.mdx",sourceDirName:"engines",slug:"/engines/state-engines",permalink:"/tods-competition-factory/docs/engines/state-engines",draft:!1,tags:[],version:"current",frontMatter:{title:"State Engines"},sidebar:"docs",previous:{title:"Publishing",permalink:"/tods-competition-factory/docs/concepts/publishing"},next:{title:"Engine Methods",permalink:"/tods-competition-factory/docs/engines/engine-methods"}},l={},p=[{value:"Engine state",id:"engine-state",level:2},{value:"Invoking Factory Functions",id:"invoking-factory-functions",level:2},{value:"Examples",id:"examples",level:2},{value:"Execute",id:"execute",level:3},{value:"Import and Execute",id:"import-and-execute",level:3},{value:"Import and Execute by Name",id:"import-and-execute-by-name",level:3},{value:"Execution Queue",id:"execution-queue",level:3},{value:"devContext",id:"devcontext",level:2},{value:"Bypassing State",id:"bypassing-state",level:2}],c={toc:p},u="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Competition Factory")," engines share a state which contains one or more ",(0,i.kt)("inlineCode",{parentName:"p"},"tournamentRecords")," and any factory functions which have been imported from ",(0,i.kt)("a",{parentName:"p",href:"/docs/governors/governors-overview"},"Governors"),"."),(0,i.kt)("p",null,"All factory engines provide logging and middleware services which resolve parameters such as ",(0,i.kt)("inlineCode",{parentName:"p"},"events")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"drawDefinitions")," from identifiers.\nMutation engines provide subscription/notification functionality."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"askEngine"),": used to ",(0,i.kt)("em",{parentName:"li"},"synchronously")," query ",(0,i.kt)("inlineCode",{parentName:"li"},"tournamentRecords")," held in state."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"syncEngine"),": used to ",(0,i.kt)("em",{parentName:"li"},"synchronously")," mutate ",(0,i.kt)("inlineCode",{parentName:"li"},"tournamentRecords")," held in state."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"asyncEngine"),": used to ",(0,i.kt)("em",{parentName:"li"},"asynchronously")," mutate ",(0,i.kt)("inlineCode",{parentName:"li"},"tournamentRecords")," held in state.")),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"All engine methods which make a mutation return either ",(0,i.kt)("inlineCode",{parentName:"p"},"{ success: true }")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"{ error }"))),(0,i.kt)("h2",{id:"engine-state"},"Engine state"),(0,i.kt)("p",null,'By default, a "deep copy" of ',(0,i.kt)("inlineCode",{parentName:"p"},"tournamentRecords")," is made as they are loaded into shared state."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"engine.setState(tournamentRecord)")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"engine.setState(tournamentRecords)"))),(0,i.kt)("p",null,"This behavior can be overridden such that engines operate directly on loaded tournamentRecords."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"engine.setState(tournamentRecord, deepCopyOptions)"))),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"deepCopyOptions")," can be either a boolean or an object which configures the behavior of the deep copy."),(0,i.kt)("h2",{id:"invoking-factory-functions"},"Invoking Factory Functions"),(0,i.kt)("p",null,"All state engines can be used to invoke factory functions in multiple ways:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"execute"),": invoke a factory function directly, parameters passed into ",(0,i.kt)("inlineCode",{parentName:"li"},"execute")," method"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"import and execute"),": invoke an imported function as an engine attribute"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"import and execute by name"),": invoke an imported function by reference")),(0,i.kt)("p",null,"Mutation engines can submit a queue of functions to be executed in sequence."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"executionQueue"),": invoke an imported function as part of a queue of functions")),(0,i.kt)("h2",{id:"examples"},"Examples"),(0,i.kt)("p",null,"For each of the following examples ",(0,i.kt)("inlineCode",{parentName:"p"},"askEngine")," and the ",(0,i.kt)("inlineCode",{parentName:"p"},"getParticipants")," method are first imported from the factory."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"import { askEngine, participantGovernor: { getParticipants } } from 'tods-competition-factory';\n\n// load a tournamentRecord into state\naskEngine.setState(tournamentRecord);\n")),(0,i.kt)("h3",{id:"execute"},"Execute"),(0,i.kt)("p",null,"Function is invoked directly, parameters passed into ",(0,i.kt)("inlineCode",{parentName:"p"},"execute")," method."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"const { participants } = askEngine.execute({ getParticipants, ...params });\n")),(0,i.kt)("h3",{id:"import-and-execute"},"Import and Execute"),(0,i.kt)("p",null,"Function is imported and invoked as an engine attribute."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.importMethods({ getParticipants });\nconst { participants } = askEngine.getParticipants({ withIndividualParticipants: true });\n")),(0,i.kt)("h3",{id:"import-and-execute-by-name"},"Import and Execute by Name"),(0,i.kt)("p",null,"Function is imported and invoked by reference."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.importMethods({ getParticipants });\nconst { participants } = askEngine.execute({\n  params: { participantFilters: { participantTypes: [PAIR] } },\n  method: 'getParticipants',\n});\n")),(0,i.kt)("h3",{id:"execution-queue"},"Execution Queue"),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"executionQueue")," method accepts an array of imported governor methods and associated parameters,\nallowing for multiple queries or mutations in a single API call, which is significant if a client is making a\nrequest of a server and the server needs to prepare context by loading a tournament record."),(0,i.kt)("p",null,"An additional benefit of the ",(0,i.kt)("inlineCode",{parentName:"p"},"executionQueue")," is that subscribers to ",(0,i.kt)("inlineCode",{parentName:"p"},"engine")," events are not notified\nuntil all methods in the queue have completed successfully, and a failure of any one method can be used to roll back state\nwith the assurance that there are no side-effects caused by subscribers responding to notifications. This also means\nthat the server context can not be blocked by any long-running external processes."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"syncEngine.importMethods({ getParticipants });\nconst result = syncEngine.executionQueue([\n  { method: 'getParticipants', params: { participantFilters: { participantTypes: [INDIVIDUAL] } } },\n]);\nconst { participants } = result[0];\n")),(0,i.kt)("h2",{id:"devcontext"},"devContext"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"devConext")," is a property of engine state which is used to store any data which is useful for development purposes."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"The devContext value can be either a boolean or an object."),(0,i.kt)("li",{parentName:"ul"},"When there is a devContext value present, the ",(0,i.kt)("inlineCode",{parentName:"li"},"try {} catch {}")," block is ",(0,i.kt)("strong",{parentName:"li"},"NOT")," used in method invocation."),(0,i.kt)("li",{parentName:"ul"},"When devContext is an object it is used to configure engine logging.")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.devContext(true); // default\naskEngine.devContext(false); // do not catch internal errors\n")),(0,i.kt)("h2",{id:"bypassing-state"},"Bypassing State"),(0,i.kt)("p",null,"Passing ",(0,i.kt)("inlineCode",{parentName:"p"},"tournamentRecord")," as a parameter to any engine method will operate directly on the passed ",(0,i.kt)("inlineCode",{parentName:"p"},"tournamentRecord"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-js"},"askEngine.getParticipants({ tournamentRecord });\n")),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"When ",(0,i.kt)("inlineCode",{parentName:"p"},"tournamentRecord")," is passed as a parameter, a temporary ",(0,i.kt)("inlineCode",{parentName:"p"},"tournamentRecords")," object is created and any ",(0,i.kt)("inlineCode",{parentName:"p"},"tournamentRecords")," in state are not referenced.")))}d.isMDXComponent=!0}}]);