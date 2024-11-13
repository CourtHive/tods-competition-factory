"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[6865],{3805:(e,t,n)=>{n.d(t,{xA:()=>l,yg:()=>m});var r=n(758);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},l=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},y=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),u=s(n),y=i,m=u["".concat(p,".").concat(y)]||u[y]||d[y]||o;return n?r.createElement(m,a(a({ref:t},l),{},{components:n})):r.createElement(m,a({ref:t},l))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=y;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[u]="string"==typeof e?e:i,a[1]=c;for(var s=2;s<o;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}y.displayName="MDXCreateElement"},6564:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>a,default:()=>d,frontMatter:()=>o,metadata:()=>c,toc:()=>s});var r=n(2232),i=(n(758),n(3805));const o={title:"Participant Types"},a=void 0,c={unversionedId:"concepts/participants",id:"concepts/participants",title:"Participant Types",description:'Participant "agnostic"',source:"@site/docs/concepts/participants.md",sourceDirName:"concepts",slug:"/concepts/participants",permalink:"/tods-competition-factory/docs/concepts/participants",draft:!1,tags:[],version:"current",frontMatter:{title:"Participant Types"},sidebar:"docs",previous:{title:"Migration 1.x to 2.x",permalink:"/tods-competition-factory/docs/migration"},next:{title:"Context / Hydration",permalink:"/tods-competition-factory/docs/concepts/participant-context"}},p={},s=[{value:"Participant &quot;agnostic&quot;",id:"participant-agnostic",level:2}],l={toc:s},u="wrapper";function d(e){let{components:t,...n}=e;return(0,i.yg)(u,(0,r.A)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,i.yg)("h2",{id:"participant-agnostic"},'Participant "agnostic"'),(0,i.yg)("p",null,'The logic governing movements within draws is "participant agnostic", and doesn\'t know or care whether the participants moving through the ',(0,i.yg)("inlineCode",{parentName:"p"},"structures")," of a draw are ",(0,i.yg)("inlineCode",{parentName:"p"},"participantType")," INDIVIDUAL, PAIR or TEAM."),(0,i.yg)("p",null,"When participants progress through ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUps")," within and across ",(0,i.yg)("inlineCode",{parentName:"p"},"structures")," the logic requires only ",(0,i.yg)("inlineCode",{parentName:"p"},"positionAssignments"),", which are used when requesting ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUps"),' with "context" to add ',(0,i.yg)("inlineCode",{parentName:"p"},"sides")," which include ",(0,i.yg)("inlineCode",{parentName:"p"},"participants"),"."))}d.isMDXComponent=!0}}]);