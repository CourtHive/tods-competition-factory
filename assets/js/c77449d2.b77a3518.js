"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3447],{3805:(e,n,o)=>{o.d(n,{xA:()=>y,yg:()=>u});var r=o(758);function t(e,n,o){return n in e?Object.defineProperty(e,n,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[n]=o,e}function i(e,n){var o=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),o.push.apply(o,r)}return o}function a(e){for(var n=1;n<arguments.length;n++){var o=null!=arguments[n]?arguments[n]:{};n%2?i(Object(o),!0).forEach((function(n){t(e,n,o[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(o)):i(Object(o)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(o,n))}))}return e}function l(e,n){if(null==e)return{};var o,r,t=function(e,n){if(null==e)return{};var o,r,t={},i=Object.keys(e);for(r=0;r<i.length;r++)o=i[r],n.indexOf(o)>=0||(t[o]=e[o]);return t}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)o=i[r],n.indexOf(o)>=0||Object.prototype.propertyIsEnumerable.call(e,o)&&(t[o]=e[o])}return t}var c=r.createContext({}),p=function(e){var n=r.useContext(c),o=n;return e&&(o="function"==typeof e?e(n):a(a({},n),e)),o},y=function(e){var n=p(e.components);return r.createElement(c.Provider,{value:n},e.children)},s="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var o=e.components,t=e.mdxType,i=e.originalType,c=e.parentName,y=l(e,["components","mdxType","originalType","parentName"]),s=p(o),m=t,u=s["".concat(c,".").concat(m)]||s[m]||d[m]||i;return o?r.createElement(u,a(a({ref:n},y),{},{components:o})):r.createElement(u,a({ref:n},y))}));function u(e,n){var o=arguments,t=n&&n.mdxType;if("string"==typeof e||t){var i=o.length,a=new Array(i);a[0]=m;var l={};for(var c in n)hasOwnProperty.call(n,c)&&(l[c]=n[c]);l.originalType=e,l[s]="string"==typeof e?e:t,a[1]=l;for(var p=2;p<i;p++)a[p]=o[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,o)}m.displayName="MDXCreateElement"},5568:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>d,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var r=o(2232),t=(o(758),o(3805));const i={title:"Policy Governor"},a=void 0,l={unversionedId:"governors/policy-governor",id:"governors/policy-governor",title:"Policy Governor",description:"attachPolicies",source:"@site/docs/governors/policy-governor.md",sourceDirName:"governors",slug:"/governors/policy-governor",permalink:"/tods-competition-factory/docs/governors/policy-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"Policy Governor"},sidebar:"docs",previous:{title:"Participant Governor",permalink:"/tods-competition-factory/docs/governors/participant-governor"},next:{title:"Publishing Governor",permalink:"/tods-competition-factory/docs/governors/publishing-governor"}},c={},p=[{value:"attachPolicies",id:"attachpolicies",level:2},{value:"findPolicy",id:"findpolicy",level:2},{value:"removePolicy",id:"removepolicy",level:2}],y={toc:p},s="wrapper";function d(e){let{components:n,...o}=e;return(0,t.yg)(s,(0,r.A)({},y,o,{components:n,mdxType:"MDXLayout"}),(0,t.yg)("pre",null,(0,t.yg)("code",{parentName:"pre",className:"language-js"},"import { policyGovernor } from 'tods-competition-factory';\n")),(0,t.yg)("h2",{id:"attachpolicies"},"attachPolicies"),(0,t.yg)("p",null,"Attaches policy definitions to ",(0,t.yg)("inlineCode",{parentName:"p"},"tournamentRecords"),", a ",(0,t.yg)("inlineCode",{parentName:"p"},"tournamentRecord"),", an ",(0,t.yg)("inlineCode",{parentName:"p"},"event"),", or a ",(0,t.yg)("inlineCode",{parentName:"p"},"drawDefinition"),"."),(0,t.yg)("p",null,"See ",(0,t.yg)("a",{parentName:"p",href:"/docs/concepts/policies"},"Policies"),"."),(0,t.yg)("pre",null,(0,t.yg)("code",{parentName:"pre",className:"language-js"},"engine.attachPolicies({\n  policyDefinitions: SEEDING_POLICY,\n  allowReplacement, // optional boolean\n  tournamentId, // optional\n  eventId, // optional\n  drawId, // optional\n});\n")),(0,t.yg)("hr",null),(0,t.yg)("h2",{id:"findpolicy"},"findPolicy"),(0,t.yg)("p",null,"Find ",(0,t.yg)("inlineCode",{parentName:"p"},"policyType")," on a ",(0,t.yg)("inlineCode",{parentName:"p"},"tournamentRecord"),", an ",(0,t.yg)("inlineCode",{parentName:"p"},"event"),", or a ",(0,t.yg)("inlineCode",{parentName:"p"},"drawDefinition"),"."),(0,t.yg)("pre",null,(0,t.yg)("code",{parentName:"pre",className:"language-js"},"const { policy } = engine.findPolicy({\n  policyType: POLICY_TYPE_SCORING,\n  tournamentId, // optional\n  eventId, // optional\n  drawId, // optional\n});\n")),(0,t.yg)("hr",null),(0,t.yg)("h2",{id:"removepolicy"},"removePolicy"),(0,t.yg)("pre",null,(0,t.yg)("code",{parentName:"pre",className:"language-js"},"engine.removePolicy({ policyType }); // remove from all tournamentRecords\nengine.removePolicy({ policyType, tournamentId }); // remove from specified tournamentRecord\nengine.removePolicy({ policyType, eventId }); // remove from specified event\nengine.removePolicy({ policyType, drawId }); // remove from specified drawDefinition\n")),(0,t.yg)("hr",null))}d.isMDXComponent=!0}}]);