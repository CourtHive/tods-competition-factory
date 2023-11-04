"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4195],{4748:(e,t,n)=>{n.r(t),n.d(t,{default:()=>h});n(959);function s(e){var t,n,i="";if("string"==typeof e||"number"==typeof e)i+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=s(e[t]))&&(i&&(i+=" "),i+=n);else for(t in e)e[t]&&(i&&(i+=" "),i+=t);return i}const i=function(){for(var e,t,n=0,i="";n<arguments.length;)(e=arguments[n++])&&(t=s(e))&&(i&&(i+=" "),i+=t);return i};var r=n(6587),a=n(5719),o=n(619),l=n(5006);const c={heroBanner:"heroBanner_UJJx",buttons:"buttons_pzbO",features:"features_keug",featureImage:"featureImage_yA8i"};var d=n(1527);const m=[{title:"Standards based",imageUrl:"img/TODS.png",imageLink:"https://itftennis.atlassian.net/wiki/spaces/TODS/overview",description:(0,d.jsx)(d.Fragment,{children:"The Competition Factory consumes, produces, and generates ITF standard TODS documents (a JSON format) and ensures that all mutations are valid."})},{title:"Proven in production",imageUrl:"img/tmx.png",imageLink:"https://courthive.github.io/TMX/#/",description:(0,d.jsx)(d.Fragment,{children:"Based on years of experience running thousands of events for numerous governing bodies, Competition Factory now powers the tournament management platform of the USTA and the Intercollegiate Tennis Association."})},{title:"Rigorously tested",imageUrl:"img/vitest-logo.svg",description:(0,d.jsx)(d.Fragment,{children:"Written in 100% TypeScript following a Test Driven Development process utilizing Vitest. More than 470 test files and 1850 total tests cover more than 96% of the code base."})}];function u(e){let{imageLink:t,imageUrl:n,title:s,description:r}=e;const a=(0,l.Z)(n);return(0,d.jsxs)("div",{className:i("col col--4",c.feature),onClick:()=>function(e){e&&window.open(e,"_blank","noopener,noreferrer")}(t),children:[a&&(0,d.jsx)("div",{className:"text--center",children:(0,d.jsx)("img",{className:c.featureImage,src:a,alt:s})}),(0,d.jsx)("h3",{children:s}),(0,d.jsx)("p",{children:r})]})}function h(){const e=(0,o.Z)(),{siteConfig:t={}}=e;return(0,d.jsxs)(r.Z,{title:`${t.title}`,description:"Tournament Management Components",children:[(0,d.jsx)("header",{className:i("hero hero--primary",c.heroBanner),children:(0,d.jsxs)("div",{className:"container",children:[(0,d.jsx)("h1",{className:"hero__title",children:t.title}),(0,d.jsx)("p",{className:"hero__subtitle",children:t.tagline}),(0,d.jsx)("div",{className:c.buttons,children:(0,d.jsx)(a.Z,{style:{color:"lightgreen"},className:i("button button--outline button--secondary button--lg",c.getStarted),to:(0,l.Z)("docs/"),children:"Get Started"})})]})}),(0,d.jsx)("main",{children:m&&m.length>0&&(0,d.jsx)("section",{className:c.features,children:(0,d.jsx)("div",{className:"container",children:(0,d.jsx)("div",{className:"row",children:m.map(((e,t)=>(0,d.jsx)(u,{...e},t)))})})})})]})}}}]);