"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2854],{3805:(e,n,t)=>{t.d(n,{xA:()=>c,yg:()=>g});var a=t(758);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var d=a.createContext({}),p=function(e){var n=a.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},c=function(e){var n=p(e.components);return a.createElement(d.Provider,{value:n},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},u=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),s=p(t),u=i,g=s["".concat(d,".").concat(u)]||s[u]||m[u]||r;return t?a.createElement(g,o(o({ref:n},c),{},{components:t})):a.createElement(g,o({ref:n},c))}));function g(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var r=t.length,o=new Array(r);o[0]=u;var l={};for(var d in n)hasOwnProperty.call(n,d)&&(l[d]=n[d]);l.originalType=e,l[s]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<r;p++)o[p]=t[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}u.displayName="MDXCreateElement"},469:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>o,default:()=>m,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var a=t(2232),i=(t(758),t(3805));const r={title:"Automated Scheduling"},o=void 0,l={unversionedId:"concepts/automated-scheduling",id:"concepts/automated-scheduling",title:"Automated Scheduling",description:"Automated Scheduling",source:"@site/docs/concepts/automated-scheduling.md",sourceDirName:"concepts",slug:"/concepts/automated-scheduling",permalink:"/tods-competition-factory/docs/concepts/automated-scheduling",draft:!1,tags:[],version:"current",frontMatter:{title:"Automated Scheduling"},sidebar:"docs",previous:{title:"Scheduling Profile",permalink:"/tods-competition-factory/docs/concepts/scheduling-profile"},next:{title:"Pro Scheduling",permalink:"/tods-competition-factory/docs/concepts/pro-scheduling"}},d={},p=[{value:"Automated Scheduling",id:"automated-scheduling",level:2},{value:"Pseudocode",id:"pseudocode",level:3}],c={toc:p},s="wrapper";function m(e){let{components:n,...t}=e;return(0,i.yg)(s,(0,a.A)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,i.yg)("h2",{id:"automated-scheduling"},"Automated Scheduling"),(0,i.yg)("p",null,"Once the ",(0,i.yg)("inlineCode",{parentName:"p"},"schedulingProfile"),", ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUpFormatTiming")," and ",(0,i.yg)("inlineCode",{parentName:"p"},"dailyLimits")," have been defined, automated assignment of ",(0,i.yg)("strong",{parentName:"p"},"scheduleTimes")," to ",(0,i.yg)("inlineCode",{parentName:"p"},"matchUps")," is straightforward."),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-js"},"engine.scheduleProfileRounds({\n  scheduleDates, // optional array of dates to be scheduled\n});\n")),(0,i.yg)("h3",{id:"pseudocode"},"Pseudocode"),(0,i.yg)("p",null,"The highest level auto-scheduling method is ",(0,i.yg)("inlineCode",{parentName:"p"},"engine.scheduleProfileRounds"),"."),(0,i.yg)("ol",null,(0,i.yg)("li",{parentName:"ol"},"Validate and filter ",(0,i.yg)("inlineCode",{parentName:"li"},"schedulingProfile")," dates by specified ",(0,i.yg)("inlineCode",{parentName:"li"},"scheduleDates")),(0,i.yg)("li",{parentName:"ol"},"Construct ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpDependencies")," to ensure matchUps are scheduled before their dependents"),(0,i.yg)("li",{parentName:"ol"},"Get an array of ",(0,i.yg)("strong",{parentName:"li"},"inContext")," ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUps")," for all relevant ",(0,i.yg)("inlineCode",{parentName:"li"},"tournamentRecords")),(0,i.yg)("li",{parentName:"ol"},"Retrieve ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpDailyLimits")," and ",(0,i.yg)("inlineCode",{parentName:"li"},"personRequests")),(0,i.yg)("li",{parentName:"ol"},"Sort ",(0,i.yg)("inlineCode",{parentName:"li"},"scheduleDates")," and for each iterate through all venues"),(0,i.yg)("li",{parentName:"ol"},"Construct hash tables of ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpNotBeforeTimes")," and ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpPotentialParticipantIds")),(0,i.yg)("li",{parentName:"ol"},"Ensure ",(0,i.yg)("inlineCode",{parentName:"li"},"rounds")," specified for ",(0,i.yg)("inlineCode",{parentName:"li"},"scheduleDate")," are sorted as specified"),(0,i.yg)("li",{parentName:"ol"},"Generate ordered array of ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpIds")," derived from specified ",(0,i.yg)("inlineCode",{parentName:"li"},"rounds")),(0,i.yg)("li",{parentName:"ol"},"Build up a mapping of ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpIds")," to ",(0,i.yg)("inlineCode",{parentName:"li"},"recoveryMinutes")," so that ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUps")," with equivalent ",(0,i.yg)("inlineCode",{parentName:"li"},"averageMatchUpMinutes"),"\ncan be block scheduled while still considering varying ",(0,i.yg)("inlineCode",{parentName:"li"},"recoveryMinutes")),(0,i.yg)("li",{parentName:"ol"},"Group ordered ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpIds")," by ",(0,i.yg)("strong",{parentName:"li"},"averageMatchUpMinutes|periodLength")),(0,i.yg)("li",{parentName:"ol"},"Loop through groups of ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpIds")," ..."),(0,i.yg)("li",{parentName:"ol"},"Calculate available scheduleTimes, considering court availability, already scheduled matchUps, and ",(0,i.yg)("inlineCode",{parentName:"li"},"remainingScheduleTimes")," from previous iteration"),(0,i.yg)("li",{parentName:"ol"},"Construct per-participant hash tables of ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUps")," played and ",(0,i.yg)("inlineCode",{parentName:"li"},"timeAfterRecovery")),(0,i.yg)("li",{parentName:"ol"},"Filter out ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUps")," which are not appropriate for scheduling"),(0,i.yg)("li",{parentName:"ol"},"Filter out ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUps")," which include participants who have reached daily limits"),(0,i.yg)("li",{parentName:"ol"},"Loop through available ",(0,i.yg)("inlineCode",{parentName:"li"},"scheduleTimes")," and build up mapping of ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpIds")," to ",(0,i.yg)("inlineCode",{parentName:"li"},"scheduleTimes"),(0,i.yg)("ul",{parentName:"li"},(0,i.yg)("li",{parentName:"ul"},"Defer scheduling of matchUps where ",(0,i.yg)("inlineCode",{parentName:"li"},"timeAfterRecovery")," has not been reached"),(0,i.yg)("li",{parentName:"ul"},"Defer scheduling of matchUps where ",(0,i.yg)("inlineCode",{parentName:"li"},"personRequests")," include ",(0,i.yg)("inlineCode",{parentName:"li"},"{ requestType: DO_NOT_SCHEDULE }")," conflicts"))),(0,i.yg)("li",{parentName:"ol"},"Group ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUpIds")," by ",(0,i.yg)("strong",{parentName:"li"},"eventId|drawId|structureId")," and assign ",(0,i.yg)("inlineCode",{parentName:"li"},"scheduleTimes")," to ",(0,i.yg)("inlineCode",{parentName:"li"},"matchUps")),(0,i.yg)("li",{parentName:"ol"},"Return array of ",(0,i.yg)("inlineCode",{parentName:"li"},"remainingScheduleTimes")," from current iteration to seed next iteration of virtualCourtBookings")))}m.isMDXComponent=!0}}]);