(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{ScCt:function(e,t,n){"use strict";n.r(t),n.d(t,"_frontmatter",(function(){return s})),n.d(t,"default",(function(){return b}));var a=n("Fcif"),i=n("+I+c"),r=n("/FXl"),m=n("TjRS"),s=(n("aD51"),{});void 0!==s&&s&&s===Object(s)&&Object.isExtensible(s)&&!s.hasOwnProperty("__filemeta")&&Object.defineProperty(s,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/documentation/timeItems.md"}});var c={_frontmatter:s},o=m.a;function b(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(r.b)(o,Object(a.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h1",{id:"time-items"},"Time Items"),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"timeItems")," can exist on any document element in TODS and are used to capture attributes which may change over time and where it is desierable to keep track of such changes."),Object(r.b)("p",null,"For instance, a ",Object(r.b)("strong",{parentName:"p"},"matchUp")," may be assigned to one court and scheduled, and then be interrupted and re-scheduled to start later on another court. ",Object(r.b)("strong",{parentName:"p"},"matchUp")," ",Object(r.b)("em",{parentName:"p"},"duration")," can be calculated from all ",Object(r.b)("strong",{parentName:"p"},"timeItems")," which relate to the starting and stopping of play."),Object(r.b)("h2",{id:"object-properties"},"Object properties"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const timeItem = {\n  itemType: 'SCALE.RANKING.SINGLES.WTN',\n  itemSubTypes; [], // optional\n  itemValue: 13.20,\n  itemDate: '2020-01-01T00:00',\n  createdAt: '2020-01-03T06:21'\n}\n")),Object(r.b)("h3",{id:"itemtype-and-itemsubtypes"},"itemType and itemSubTypes"),Object(r.b)("p",null,"itemType is a string, while itemSubTypes is an array of strings. In Competition Factory itemType uses dot notation to represent a hierarchical structure. This is useful for matching fragments of a type in some internal functions."),Object(r.b)("h4",{id:"example-itemtypes"},"Example itemTypes"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"itemType: 'SCHEDULE.ASSIGNMENT.VENUE',\nitemType: 'SCHEDULE.ASSIGNMENT.COURT',\nitemType: 'SCHEDULE.ASSIGNMENT.OFFICIAL',\nitemType: 'SCHEDULE.DATE',\nitemType: 'SCHEDULE.TIME.SCHEDULED',\nitemType: 'SCHEDULE.TIME.START',\nitemType: 'SCHEDULE.TIME.STOP',\nitemType: 'SCHEDULE.TIME.RESUME',\nitemType: 'SCHEDULE.TIME.END,\n")),Object(r.b)("h2",{id:"internal-usage"},"Internal usage"),Object(r.b)("p",null,"In most cases ",Object(r.b)("strong",{parentName:"p"},"timeItems")," are used internally by the various Competition Factory engines."),Object(r.b)("h3",{id:"participants"},"Participants"),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"timeItems")," are used to track participant registration, sign-in and payment status as well as penalties and rankings and ratings values for different event categories. They are also used to capture manual seedings for events."),Object(r.b)("h3",{id:"matchups"},"matchUps"),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"timeItems")," are used to capture scheduling attributes including start, stop, resume, end as well as assignment of court, referee & etc. Schedule related attributes are extracted from ",Object(r.b)("strong",{parentName:"p"},"timeItems"),' when a matchUp is retrieved with "context" and added to the ',Object(r.b)("strong",{parentName:"p"},"matchUp.schedule")," object."),Object(r.b)("h2",{id:"other-use-cases"},"Other use cases"),Object(r.b)("p",null,"Competition Factory defines methods for adding and retrieving arbitrary ",Object(r.b)("strong",{parentName:"p"},"timeItems")," for the tournament record, event, and drawDefinitions."),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"tournamentEngine.addTournamentTimeItem({ timeItem });\ntournamentEngine.addEventTimeItem({ eventId, timeItem });\ntournamentEngine.addDrawDefinitionTimeItem({ drawId, timeItem });\n\ntournamentEngine.getTournamentTimeItem({ itemType, itemSubTypes });\ntournamentEngine.getEventTimeItem({ eventId, itemType, itemSubTypes });\ntournamentEngine.getDrawDefinitionTimeItem({ drawId, itemType, itemSubTypes });\n")),Object(r.b)("h3",{id:"ranking-and-ratings"},"Ranking and Ratings"),Object(r.b)("p",null,"Sometimes a tournament organizer may want to fetch player Rankings and Ratings from a remote service. In such scenarios it is desireable to both capture a time stamp for when the last retrieval occurred and be able to query an event's ",Object(r.b)("strong",{parentName:"p"},"timeItems")," to be able to display the value."),Object(r.b)("h4",{id:"adding-a-timeitem-to-an-event"},"Adding a timeITem to an event"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const timeItem = {\n  itemType: 'RETRIEVAL.RANKING.SINGLES.U18',\n  itemValue: '2021-01-01T00:00',\n};\ntournamentEngine.addEventTimeItem({ eventId, timeItem });\n")),Object(r.b)("h4",{id:"retrieving-a-timeitem-from-an-event"},"Retrieving a timeITem from an event"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const {\n  timeItem: retrievedTimeItem,\n  message,\n} = tournamentEngine.getEventTimeItem({\n  itemType: 'RETRIEVAL.RANKING.SINGLES.U18',\n  eventId,\n});\n")))}void 0!==b&&b&&b===Object(b)&&Object.isExtensible(b)&&!b.hasOwnProperty("__filemeta")&&Object.defineProperty(b,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/documentation/timeItems.md"}}),b.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-documentation-time-items-md-a2014a7ae190122d99ac.js.map