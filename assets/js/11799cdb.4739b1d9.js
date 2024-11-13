"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[9547],{3805:(e,n,r)=>{r.d(n,{xA:()=>p,yg:()=>m});var t=r(758);function o(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function a(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function i(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?a(Object(r),!0).forEach((function(n){o(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function s(e,n){if(null==e)return{};var r,t,o=function(e,n){if(null==e)return{};var r,t,o={},a=Object.keys(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||(o[r]=e[r]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=t.createContext({}),c=function(e){var n=t.useContext(l),r=n;return e&&(r="function"==typeof e?e(n):i(i({},n),e)),r},p=function(e){var n=c(e.components);return t.createElement(l.Provider,{value:n},e.children)},d="mdxType",g={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},u=t.forwardRef((function(e,n){var r=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=c(r),u=o,m=d["".concat(l,".").concat(u)]||d[u]||g[u]||a;return r?t.createElement(m,i(i({ref:n},p),{},{components:r})):t.createElement(m,i({ref:n},p))}));function m(e,n){var r=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=u;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s[d]="string"==typeof e?e:o,i[1]=s;for(var c=2;c<a;c++)i[c]=r[c];return t.createElement.apply(null,i)}return t.createElement.apply(null,r)}u.displayName="MDXCreateElement"},8025:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>l,contentTitle:()=>i,default:()=>g,frontMatter:()=>a,metadata:()=>s,toc:()=>c});var t=r(2232),o=(r(758),r(3805));const a={title:"Score Governor"},i=void 0,s={unversionedId:"governors/score-governor",id:"governors/score-governor",title:"Score Governor",description:"The scoreGovernor is a collection of scoring related tools that provide analysis/validation or generate values.",source:"@site/docs/governors/score-governor.md",sourceDirName:"governors",slug:"/governors/score-governor",permalink:"/tods-competition-factory/docs/governors/score-governor",draft:!1,tags:[],version:"current",frontMatter:{title:"Score Governor"},sidebar:"docs",previous:{title:"Schedule Governor",permalink:"/tods-competition-factory/docs/governors/schedule-governor"},next:{title:"Tournament Governor",permalink:"/tods-competition-factory/docs/governors/tournament-governor"}},l={},c=[{value:"analyzeSet",id:"analyzeset",level:2},{value:"checkSetIsComplete",id:"checksetiscomplete",level:2},{value:"generateScoreString",id:"generatescorestring",level:2},{value:"getSetComplement",id:"getsetcomplement",level:2},{value:"getTiebreakComplement",id:"gettiebreakcomplement",level:2},{value:"generateTieMatchUpScore",id:"generatetiematchupscore",level:2},{value:"isValidMatchUpFormat",id:"isvalidmatchupformat",level:2},{value:"keyValueScore",id:"keyvaluescore",level:2},{value:"participantResults",id:"participantresults",level:3},{value:"GEMscore",id:"gemscore",level:4},{value:"parseScoreString",id:"parsescorestring",level:2},{value:"validateTieFormat",id:"validatetieformat",level:2}],p={toc:c},d="wrapper";function g(e){let{components:n,...r}=e;return(0,o.yg)(d,(0,t.A)({},p,r,{components:n,mdxType:"MDXLayout"}),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"import { scoreGovernor } from 'tods-competition-factory';\n")),(0,o.yg)("p",null,"The ",(0,o.yg)("strong",{parentName:"p"},"scoreGovernor")," is a collection of scoring related tools that provide analysis/validation or generate values."),(0,o.yg)("p",null,"Lightweight independent/reusable components such as scoring dialogs can make use of the ",(0,o.yg)("strong",{parentName:"p"},"scoreGovernor")," without having to import any Competition Factory engines."),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"analyzeset"},"analyzeSet"),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const {\n  expectTiebreakSet,\n  expectTimedSet,\n  hasTiebreakCondition,\n  isCompletedSet,\n  isDecidingSet,\n  isTiebreakSet,\n  isValidSet,\n  isValidSetNumber,\n  isValidSetOutcome,\n  setFormat,\n  sideGameScores,\n  sideGameScoresCount,\n  sidePointScores,\n  sidePointScoresCount,\n  sideTiebreakScores,\n  sideTiebreakScoresCount,\n  winningSide,\n} = scoreGovernor.analyzeSet({\n  matchUpScoringFormat,\n  setObject,\n});\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"checksetiscomplete"},"checkSetIsComplete"),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const hasWinningSide = scoreGovernor.checkSetIsComplete({\n  set: {\n    side1Score,\n    side2Score,\n    ignoreTiebreak,\n    matchUpFormat,\n    isDecidingSet,\n    isTiebreakSet,\n  },\n});\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"generatescorestring"},"generateScoreString"),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const sets = [\n  {\n    side1Score: 6,\n    side2Score: 7,\n    side1TiebreakScore: 3,\n    side2TiebreakScore: 7,\n    winningSide: 2,\n  },\n  {\n    side1Score: 7,\n    side2Score: 6,\n    side1TiebreakScore: 14,\n    side2TiebreakScore: 12,\n    winningSide: 1,\n  },\n  { side1Score: 3 },\n];\nlet result = scoreGovernor.generateScoreString({\n    sets, // TODS sets object\n    winningSide, // optional - 1 or 2\n    reversed, // optional - reverse the score\n    winnerFirst = true, // optional - boolean - tranform sets so that winningSide is first (on left)\n    matchUpStatus, // optional - used to annotate scoreString\n    addOutcomeString, // optional - tranform matchUpStatus into outcomeString appended to scoreString\n    autoComplete: true, // optional - complete missing set score\n  });\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"getsetcomplement"},"getSetComplement"),(0,o.yg)("p",null,"Returns complementary sideScore given a ",(0,o.yg)("inlineCode",{parentName:"p"},"lowValue"),", ",(0,o.yg)("inlineCode",{parentName:"p"},"tieBreakAt")," and ",(0,o.yg)("inlineCode",{parentName:"p"},"setTo")," details."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const [side1Score, side2Score] = scoreGovernor.getSetComplement({\n  tiebreakAt,\n  lowValue,\n  isSide1,\n  setTo,\n});\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"gettiebreakcomplement"},"getTiebreakComplement"),(0,o.yg)("p",null,"Returns complementary sideScore given a ",(0,o.yg)("inlineCode",{parentName:"p"},"lowValue"),", ",(0,o.yg)("inlineCode",{parentName:"p"},"tieBreakNoAd")," and ",(0,o.yg)("inlineCode",{parentName:"p"},"tiebreakTo")," details."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},'const [side1Score, side2Score] = scoreGovernor.getSetComplement({\n  tiebreakNoAd, // boolean whether tiebreak is "no advantage"\n  tiebreakTo,\n  lowValue,\n  isSide1,\n});\n')),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"generatetiematchupscore"},"generateTieMatchUpScore"),(0,o.yg)("p",null,"Returns string representation of current tieMatchUp score."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const { scoreStringSide1, scoreStringSide2, set, winningSide } = scoreGovernor.generateTieMatchUpScore({\n  matchUp, // must have { matchUpType: 'TEAM' }\n  separator, // optional - defaults to '-'\n});\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"isvalidmatchupformat"},"isValidMatchUpFormat"),(0,o.yg)("p",null,"Returns boolean indicating whether matchUpFormat code is valid."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const valid = scoreGovernor.isValidMatchUpFormat({ matchUpFormat });\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"keyvaluescore"},"keyValueScore"),(0,o.yg)("p",null,"Utility for generating score strings based on key entry. Please see ",(0,o.yg)("inlineCode",{parentName:"p"},"keyValueScore.test.js")," in the source for more detail."),(0,o.yg)("hr",null),(0,o.yg)("h3",{id:"participantresults"},"participantResults"),(0,o.yg)("p",null,"An array of ",(0,o.yg)("inlineCode",{parentName:"p"},"{ drawPosition, participantId, participantResult }")," objects is returned for each group of processed matchUps."),(0,o.yg)("p",null,"In the example given below 3 of 4 participants were tied with equivalent metrics and final ",(0,o.yg)("inlineCode",{parentName:"p"},"rankOrder")," was determined by ",(0,o.yg)("strong",{parentName:"p"},"Head to Head")," analysis.\nSee ",(0,o.yg)("a",{parentName:"p",href:"/docs/policies/tallyPolicy"},"Round Robin Tally Policy"),"."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"{\n  drawPosition: 4,\n  participantId: 'uniqueParticipantId1',\n  participantResult: {\n    allDefaults: 0,\n    defaults: 0,\n    retirements: 0,\n    walkovers: 0,\n    matchUpsWon: 3,\n    matchUpsLost: 1,\n    victories: [\n      'uniqueMatchUpId1',\n      'uniqueMatchUpId2',\n      'uniqueMatchUpId3',\n    ],\n    defeats: ['uniqueMatchUpId4'],\n    matchUpsCancelled: 0,\n    setsWon: 6,\n    setsLost: 2,\n    gamesWon: 36,\n    gamesLost: 12,\n    pointsWon: 0,\n    pointsLost: 0,\n    setsPct: 3,\n    matchUpsPct: 3,\n    gamesPct: 0.75,\n    pointsPct: 0,\n    result: '3/1',\n    games: '36/12',\n    provisionalOrder: 1, // order when ROUND_ROBIN groups are incomplete;\n    groupOrder: 1, // order including manually entered 'subOrder' (for statistical ties)\n    rankOrder: 1, // order without manually entered 'subOrder'\n    GEMscore: 30003000075000000,\n  },\n};\n")),(0,o.yg)("h4",{id:"gemscore"},"GEMscore"),(0,o.yg)("p",null,(0,o.yg)("inlineCode",{parentName:"p"},"GEMscore")," is a hash of key participant metrics and is used for sorting participants from multiple groups where ",(0,o.yg)("strong",{parentName:"p"},"Head to Head"),' does not apply.\nThis is used to determine "seedProxies" when ordered participants from each group progress to playoff strutures.'),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const GEM =\n  matchUpsPct * Math.pow(10, 20) +\n  tieMatchUpsPct * Math.pow(10, 16) +\n  setsPct * Math.pow(10, 12) +\n  gamesPct * Math.pow(10, 8) +\n  pointsPct * Math.pow(10, 3);\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"parsescorestring"},"parseScoreString"),(0,o.yg)("p",null,"Produces TODS sets objects."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const sets = mocksEngine.parseScoreString({ scoreString: '1-6 1-6' });\n\n/*\nconsole.log(sets)\n[\n  ({\n    side1Score: 1,\n    side2Score: 6,\n    side1TiebreakScore: undefined,\n    side2TiebreakScore: undefined,\n    winningSide: 2,\n    setNumber: 1,\n  },\n  {\n    side1Score: 1,\n    side2Score: 6,\n    side1TiebreakScore: undefined,\n    side2TiebreakScore: undefined,\n    winningSide: 2,\n    setNumber: 2,\n  })\n];\n*/\n")),(0,o.yg)("hr",null),(0,o.yg)("h2",{id:"validatetieformat"},"validateTieFormat"),(0,o.yg)("p",null,"Provides validation for ",(0,o.yg)("inlineCode",{parentName:"p"},"tieFormat")," objects. See ",(0,o.yg)("a",{parentName:"p",href:"/docs/concepts/tieFormat"},"tieFormats"),"."),(0,o.yg)("pre",null,(0,o.yg)("code",{parentName:"pre",className:"language-js"},"const {\n  valid, // boolean whether valid or not\n  error,\n} = scoreGovernor.validateTieFormat({\n  checkCollectionIds, // ensure collectionId is present on all collections\n  enforceGender,\n  tieFormat,\n  gender,\n});\n")),(0,o.yg)("hr",null))}g.isMDXComponent=!0}}]);