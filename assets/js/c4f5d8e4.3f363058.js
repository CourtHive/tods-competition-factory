"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4195],{3936:(e,t,n)=>{n.r(t),n.d(t,{default:()=>f});var a=n(7462),r=n(7294);function o(e){var t,n,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=o(e[t]))&&(a&&(a+=" "),a+=n);else for(t in e)e[t]&&(a&&(a+=" "),a+=t);return a}const i=function(){for(var e,t,n=0,a="";n<arguments.length;)(e=arguments[n++])&&(t=o(e))&&(a&&(a+=" "),a+=t);return a};var s=n(7919),l=n(3699),c=n(9962),m=n(9524);const u={heroBanner:"heroBanner_UJJx",buttons:"buttons_pzbO",features:"features_keug",featureImage:"featureImage_yA8i"},g=[{title:"Standards based",imageUrl:"img/TODS.png",imageLink:"https://itftennis.atlassian.net/wiki/spaces/TODS/overview",description:r.createElement(r.Fragment,null,"The Competition Factory consumes, produces, and generates ITF standard TODS documents (a JSON format) and ensures that all mutations are valid.")},{title:"Proven in production",imageUrl:"img/tmx.png",imageLink:"https://courthive.github.io/TMX/#/",description:r.createElement(r.Fragment,null,"Based on years of experience running thousands of events for numerous governing bodies, Competition Factory now powers the tournament management platform of the USTA and the Intercollegiate Tennis Association.")},{title:"Rigorously tested",imageUrl:"img/vitest-logo.svg",description:r.createElement(r.Fragment,null,"Written in 100% TypeScript following a Test Driven Development process utilizing Vitest. More than 460 test files and 1800 total tests cover more than 96% of the code base.")}];function d(e){let{imageLink:t,imageUrl:n,title:a,description:o}=e;const s=(0,m.Z)(n);return r.createElement("div",{className:i("col col--4",u.feature),onClick:()=>function(e){e&&window.open(e,"_blank","noopener,noreferrer")}(t)},s&&r.createElement("div",{className:"text--center"},r.createElement("img",{className:u.featureImage,src:s,alt:a})),r.createElement("h3",null,a),r.createElement("p",null,o))}function f(){const e=(0,c.Z)(),{siteConfig:t={}}=e;return r.createElement(s.Z,{title:`${t.title}`,description:"Tournament Management Components"},r.createElement("header",{className:i("hero hero--primary",u.heroBanner)},r.createElement("div",{className:"container"},r.createElement("h1",{className:"hero__title"},t.title),r.createElement("p",{className:"hero__subtitle"},t.tagline),r.createElement("div",{className:u.buttons},r.createElement(l.Z,{style:{color:"lightgreen"},className:i("button button--outline button--secondary button--lg",u.getStarted),to:(0,m.Z)("docs/")},"Get Started")))),r.createElement("main",null,g&&g.length>0&&r.createElement("section",{className:u.features},r.createElement("div",{className:"container"},r.createElement("div",{className:"row"},g.map(((e,t)=>r.createElement(d,(0,a.Z)({key:t},e)))))))))}}}]);