(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{oP9p:function(e,t,n){"use strict";n.r(t),n.d(t,"_frontmatter",(function(){return s})),n.d(t,"default",(function(){return b}));var a=n("Fcif"),o=n("+I+c"),i=n("/FXl"),c=n("TjRS"),s=(n("aD51"),{});void 0!==s&&s&&s===Object(s)&&Object.isExtensible(s)&&!s.hasOwnProperty("__filemeta")&&Object.defineProperty(s,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/documentation/subscriptions.md"}});var r={_frontmatter:s},p=c.a;function b(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(i.b)(p,Object(a.a)({},r,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("h1",{id:"subscriptions"},"Subscriptions"),Object(i.b)("p",null,"Subscriptions enable external methods to be called when certain events occur while the Competition Factory engines are mutating a tournament document."),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const subscriptions = {\n  audit: (payload) => {}, // payload = [{ action: '', payload: {} }]\n  modifyMatchUp: (payload) => {}, // payload = { matchUp }\n  addMatchUps: (payload) => {}, // payload = { matchUps }\n  deletedMatchUpIds: (payload) => {}, // payload = { matchUpIds }\n};\n")),Object(i.b)("p",null,"Subscriptions can be defined for the following engines."),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"drawEngine.setSubscriptions(subscriptions);\ntournamentEngine.setSubscriptions(subscriptions);\ncompetitionEngine.setSubscriptions(subscriptions);\n")))}void 0!==b&&b&&b===Object(b)&&Object.isExtensible(b)&&!b.hasOwnProperty("__filemeta")&&Object.defineProperty(b,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/documentation/subscriptions.md"}}),b.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-documentation-subscriptions-md-57c90c2b823d791e66d4.js.map