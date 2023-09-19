"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[797],{7942:(e,n,t)=>{t.d(n,{Zo:()=>p,kt:()=>f});var o=t(959);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,o,a=function(e,n){if(null==e)return{};var t,o,a={},r=Object.keys(e);for(o=0;o<r.length;o++)t=r[o],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)t=r[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=o.createContext({}),l=function(e){var n=o.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},p=function(e){var n=l(e.components);return o.createElement(s.Provider,{value:n},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},d=o.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,s=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),m=l(t),d=a,f=m["".concat(s,".").concat(d)]||m[d]||u[d]||r;return t?o.createElement(f,i(i({ref:n},p),{},{components:t})):o.createElement(f,i({ref:n},p))}));function f(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,i=new Array(r);i[0]=d;var c={};for(var s in n)hasOwnProperty.call(n,s)&&(c[s]=n[s]);c.originalType=e,c[m]="string"==typeof e?e:a,i[1]=c;for(var l=2;l<r;l++)i[l]=t[l];return o.createElement.apply(null,i)}return o.createElement.apply(null,t)}d.displayName="MDXCreateElement"},8375:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>i,default:()=>u,frontMatter:()=>r,metadata:()=>c,toc:()=>l});var o=t(8957),a=(t(959),t(7942));const r={title:"JSON2CSV"},i=void 0,c={unversionedId:"utilities/json-to-csv",id:"utilities/json-to-csv",title:"JSON2CSV",description:"Converts an array of JSON objects into CSV.",source:"@site/docs/utilities/json-to-csv.mdx",sourceDirName:"utilities",slug:"/utilities/json-to-csv",permalink:"/tods-competition-factory/docs/utilities/json-to-csv",draft:!1,tags:[],version:"current",frontMatter:{title:"JSON2CSV"},sidebar:"docs",previous:{title:"structureSort",permalink:"/tods-competition-factory/docs/utilities/structure-sort"}},s={},l=[{value:"Example converting matchUps",id:"example-converting-matchups",level:2}],p={toc:l},m="wrapper";function u(e){let{components:n,...t}=e;return(0,a.kt)(m,(0,o.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Converts an array of ",(0,a.kt)("strong",{parentName:"p"},"JSON")," objects into ",(0,a.kt)("strong",{parentName:"p"},"CSV"),".\nProvides custom mapping of column names and merging of column values (resolves to first found in priority order), as well as custom delimiter and column/row/key joiners.\nContext attributes can be added to all rows and column-specific value replacements may be defined."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"import { utilities } from 'tods-competition-factory';\n\nconst config = {\n  includeTransformAccessors, // optional boolean - transform accessors are included with columnAccessors\n  removeEmptyColumns, // optional boolean - remove columns which contain no values\n  columnAccessors, // optional - array of column accessors to include [ 'includeThis', 'andThis' ]\n  columnTransform, // optional - multiple generated column names can resolve to a single custom column, e.g. { 'newColumnName': ['oldColumn1', 'oldColumn2' ]}\n  columnMap, // optional - simple mapping from generated columnName to custom columnName, e.g. { 'columnName': 'newColumnName' }\n  functionMap, // optional - transform values, e.g. { 'columnName': (value) => value }\n  valuesMap, // optional - map values for specified columns, e.g. { 'columnName': { 'value': 'mappedValue '}}\n  sortOrder // optional - e.g. ['columnName1', 'columnName2'] // determine order of csv columns\n  context, // optional - object defining values which should be added to all rows, e.g. { 'columnName': 'columnValue '}\n  delimiter, // optional - defaults to '\"'\n  columnJoiner, // optional - defines how CSV columns are joined; defaults to ','\n  rowJoiner, // optional - defines how CSV lines are joined; defaults to '\\r\\n'\n  keyJoiner, // optional - defines how flattened column names are constructed; defaults to '.'\n};\nconst arrayOfJSON = [{ a: 1 }, { b: 2 }];\nconst csv = utilities.JSON2CSV(arrayOfJSON, config);\n")),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("inlineCode",{parentName:"p"},"columnTransform")," mapped array elements are sensitive to order and will resolve to the first matching value"),(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("inlineCode",{parentName:"p"},"columnMap")," should not contain new columnName(s) that are ",(0,a.kt)("inlineCode",{parentName:"p"},"columnTransform")," keys")),(0,a.kt)("h2",{id:"example-converting-matchups"},"Example converting matchUps"),(0,a.kt)("p",null,"In the following example ",(0,a.kt)("strong",{parentName:"p"},"SINGLES")," and ",(0,a.kt)("strong",{parentName:"p"},"DOUBLES")," draws are generated and all ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUps")," are completed.\nThe ",(0,a.kt)("inlineCode",{parentName:"p"},"config")," object defines how ",(0,a.kt)("inlineCode",{parentName:"p"},"participants")," for each ",(0,a.kt)("inlineCode",{parentName:"p"},"side")," of each ",(0,a.kt)("inlineCode",{parentName:"p"},"matchUp")," are to be extracted,\nprioritizing the ",(0,a.kt)("inlineCode",{parentName:"p"},"accessor")," for extracting ",(0,a.kt)("inlineCode",{parentName:"p"},"{ participantType: PAIR }"),", and falling back on the ",(0,a.kt)("inlineCode",{parentName:"p"},"accessor")," for ",(0,a.kt)("inlineCode",{parentName:"p"},"participantName"),"."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:"live",live:!0},"function MocksEngineDemo(props) {\n  const drawProfiles = [\n    { drawSize: 8, eventType: 'DOUBLES', matchUpFormat: 'SET3-S:4/TB7-F:TB10' },\n    { drawSize: 8, drawType: 'ROUND_ROBIN' },\n  ];\n  const { tournamentRecord } = mocksEngine.generateTournamentRecord({\n    completeAllMatchUps: true,\n    drawProfiles,\n  });\n\n  const { matchUps } = tournamentEngine\n    .setState(tournamentRecord)\n    .allTournamentMatchUps();\n\n  const rowJoiner = '|';\n  const config = {\n    rowJoiner,\n    delimiter: '',\n    includeTransformAccessors: true,\n    columnAccessors: ['matchUpType', 'matchUpFormat', 'endDate', 'roundName'],\n    columnTransform: {\n      scoreString: ['score.scoreStringSide1'],\n      side1Participant1: [\n        'sides.0.participant.individualParticipants.0.participantName',\n        'sides.0.participant.participantName',\n      ],\n      side1Participant2: [\n        'sides.0.participant.individualParticipants.1.participantName',\n      ],\n      side2Participant1: [\n        'sides.1.participant.individualParticipants.0.participantName',\n        'sides.1.participant.participantName',\n      ],\n      side2Participant2: [\n        'sides.1.participant.individualParticipants.1.participantName',\n      ],\n    },\n  };\n\n  const csvMatchUps = utilities.JSON2CSV(matchUps, config);\n  return <RenderCSV data={csvMatchUps} rowJoiner={rowJoiner} />;\n}\n")))}u.isMDXComponent=!0}}]);