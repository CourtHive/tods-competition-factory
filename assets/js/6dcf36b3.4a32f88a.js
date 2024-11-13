"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[9136],{3805:(e,t,n)=>{n.d(t,{xA:()=>c,yg:()=>m});var o=n(758);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=o.createContext({}),l=function(e){var t=o.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},c=function(e){var t=l(e.components);return o.createElement(p.Provider,{value:t},e.children)},y="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},u=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),y=l(n),u=r,m=y["".concat(p,".").concat(u)]||y[u]||d[u]||a;return n?o.createElement(m,s(s({ref:t},c),{},{components:n})):o.createElement(m,s({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,s=new Array(a);s[0]=u;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[y]="string"==typeof e?e:r,s[1]=i;for(var l=2;l<a;l++)s[l]=n[l];return o.createElement.apply(null,s)}return o.createElement.apply(null,n)}u.displayName="MDXCreateElement"},6393:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>d,frontMatter:()=>a,metadata:()=>i,toc:()=>l});var o=n(2232),r=(n(758),n(3805));const a={title:"makeDeepCopy"},s=void 0,i={unversionedId:"tools/make-deep-copy",id:"tools/make-deep-copy",title:"makeDeepCopy",description:"Makes a deep copy of a JSON object; used internally by default to ensure that objects returns by factory query methods are immutable.",source:"@site/docs/tools/make-deep-copy.md",sourceDirName:"tools",slug:"/tools/make-deep-copy",permalink:"/tods-competition-factory/docs/tools/make-deep-copy",draft:!1,tags:[],version:"current",frontMatter:{title:"makeDeepCopy"},sidebar:"docs",previous:{title:"Tools",permalink:"/tods-competition-factory/docs/tools/tools-overview"},next:{title:"structureSort",permalink:"/tods-competition-factory/docs/tools/structure-sort"}},p={},l=[{value:"convertExtensions",id:"convertextensions",level:2},{value:"Disabling deep copies",id:"disabling-deep-copies",level:2},{value:"internalUse and deepCopyOptions",id:"internaluse-and-deepcopyoptions",level:2}],c={toc:l},y="wrapper";function d(e){let{components:t,...n}=e;return(0,r.yg)(y,(0,o.A)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.yg)("p",null,"Makes a deep copy of a JSON object; used internally by default to ensure that objects returns by factory query methods are immutable."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"import { tools } from 'tods-competition-factory';\n\ntools.makeDeepCopy(element, convertExtensions, internalUse);\n")),(0,r.yg)("h2",{id:"convertextensions"},"convertExtensions"),(0,r.yg)("p",null,"When ",(0,r.yg)("strong",{parentName:"p"},"convertExtensions")," is ",(0,r.yg)("strong",{parentName:"p"},"true"),", TODS extensions objects are converted as follows:"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"// original\nelement.extensions: [ { name: 'extensionName', value: { a: 1 } }]\n\n// after conversion\nelement._extensionName: { a: 1 }\n")),(0,r.yg)("p",null,'This is useful for inContext representations of elements such as participants where "accessor strings" can be used to directly access values rather than searching through arrays of extensions; a good example of this is in Avoidance Policies.'),(0,r.yg)("h2",{id:"disabling-deep-copies"},"Disabling deep copies"),(0,r.yg)("p",null,"In server environments where it is desireable for objects originating in back end storage (such as Mongo) to be modified directly, it is possible to disable ",(0,r.yg)("inlineCode",{parentName:"p"},"makeDeepCopy")," several ways:"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"import { globalState: { setDeepCopy } } from 'tods-competition-factory';\n\nengine.setState(tournamentRecord, false, deepCopyOptions);\n\nsetDeepCopy(false, deepCopyOptions);\n")),(0,r.yg)("h2",{id:"internaluse-and-deepcopyoptions"},"internalUse and deepCopyOptions"),(0,r.yg)("p",null,(0,r.yg)("inlineCode",{parentName:"p"},"internalUse")," is a boolean parameter which is sometimes used ",(0,r.yg)("strong",{parentName:"p"},(0,r.yg)("em",{parentName:"strong"},"within"))," factory methods to specify that ",(0,r.yg)("inlineCode",{parentName:"p"},"makeDeepCopy")," must be used regardless; it pertains to methods which return ",(0,r.yg)("strong",{parentName:"p"},"inContext")," data which should never be persisted. There are some cases where this can cause problems, so a method is provided to configure how ",(0,r.yg)("inlineCode",{parentName:"p"},"makeDeepCopy")," behaves in scenarios where it is disabled but must be used internally."),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-js"},"const deepCopyOptions = {\n  threshold, // optional integer to limit the depth of the deep copy\n  stringify: [], // any object keys in this array will be stringified (using a .toString() function if present on the object)\n  toJSON: [], // any object keys in this array will be converted to JSON if there is a .toJSON() function on the object\n  ignore: [], // any object keys in this array will be ignored\n};\n\nsetDeepCopy(false, deepCopyOptions);\n")))}d.isMDXComponent=!0}}]);