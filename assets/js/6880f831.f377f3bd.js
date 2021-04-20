(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{101:function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return m}));var r=n(0),o=n.n(r);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=o.a.createContext({}),l=function(e){var t=o.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},d=function(e){var t=l(e.components);return o.a.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},b=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,a=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),d=l(n),b=r,m=d["".concat(a,".").concat(b)]||d[b]||u[b]||i;return n?o.a.createElement(m,s(s({ref:t},p),{},{components:n})):o.a.createElement(m,s({ref:t},p))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,a=new Array(i);a[0]=b;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:r,a[1]=s;for(var p=2;p<i;p++)a[p]=n[p];return o.a.createElement.apply(null,a)}return o.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},82:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return a})),n.d(t,"toc",(function(){return s})),n.d(t,"default",(function(){return p}));var r=n(3),o=(n(0),n(101));const i={title:"Positioning Seeds"},a={unversionedId:"policies/positioningSeeds",id:"policies/positioningSeeds",isDocsHomePage:!1,title:"Positioning Seeds",description:"drawEngine manages a seedAssignments attribute of structure which expects there to be one participantId per seedNumber",source:"@site/docs/policies/positioningSeeds.md",slug:"/policies/positioningSeeds",permalink:"/tods-competition-factory/docs/policies/positioningSeeds",version:"current",sidebar:"docs",previous:{title:"Position Actions",permalink:"/tods-competition-factory/docs/policies/positionActions"},next:{title:"Scheduling Policy",permalink:"/tods-competition-factory/docs/policies/scheduling"}},s=[{value:"Seed Blocks",id:"seed-blocks",children:[]}],c={toc:s};function p({components:e,...t}){return Object(o.b)("wrapper",Object(r.a)({},c,t,{components:e,mdxType:"MDXLayout"}),Object(o.b)("p",null,Object(o.b)("strong",{parentName:"p"},"drawEngine")," manages a ",Object(o.b)("strong",{parentName:"p"},"seedAssignments")," attribute of ",Object(o.b)("strong",{parentName:"p"},"structure")," which expects there to be one ",Object(o.b)("strong",{parentName:"p"},"participantId")," per ",Object(o.b)("strong",{parentName:"p"},"seedNumber")),Object(o.b)("p",null,Object(o.b)("strong",{parentName:"p"},"seedNumber")," must be unique and serves to keep track of the ",Object(o.b)("em",{parentName:"p"},"number of seeds")," allowed within a draw structure"),Object(o.b)("p",null,"Each ",Object(o.b)("strong",{parentName:"p"},"seedAssignment")," has a ",Object(o.b)("strong",{parentName:"p"},"seedValue")," which can occur multiple times and enables multiple participants to effectively be seeded to the same ",Object(o.b)("strong",{parentName:"p"},"seedNumber"),"."),Object(o.b)("p",null,"When placing seed blocks, ",Object(o.b)("strong",{parentName:"p"},"getNextSeedBlock")," uses a policy to determine whether to return unplaced seeds whose ",Object(o.b)("strong",{parentName:"p"},"seedNumber")," is specified by the seedBlock definition, or whether to return seeded participants with the lowest ",Object(o.b)("strong",{parentName:"p"},"seedValues")," who have yet to be placed."),Object(o.b)("p",null,"When ",Object(o.b)("strong",{parentName:"p"},"seedValues")," are used it is possible to have players seeded ","[1]",",","[2]",",","[3,4]",",","[4,4,4,5]"," and for a randomly selected player seeded 4th to be placed in the 3-4 seed block, with all remaining seeded players placed in the 5-8 seed block."),Object(o.b)("h2",{id:"seed-blocks"},"Seed Blocks"),Object(o.b)("p",null,"A Seed Block is a grouping of seeded players. For a typical elimination structure the seed blocks follow the pattern"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"[1], [2], [3,4], [5,6,7,8], ...\n")))}p.isMDXComponent=!0}}]);