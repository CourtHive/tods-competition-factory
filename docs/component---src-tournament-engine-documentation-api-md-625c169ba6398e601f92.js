(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{XScD:function(e,t,a){"use strict";a.r(t),a.d(t,"_frontmatter",(function(){return i})),a.d(t,"default",(function(){return s}));var n=a("Fcif"),b=a("+I+c"),r=a("/FXl"),c=a("TjRS"),i=(a("aD51"),{});void 0!==i&&i&&i===Object(i)&&Object.isExtensible(i)&&!i.hasOwnProperty("__filemeta")&&Object.defineProperty(i,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/tournamentEngine/documentation/api.md"}});var l={_frontmatter:i},d=c.a;function s(e){var t=e.components,a=Object(b.a)(e,["components"]);return Object(r.b)(d,Object(n.a)({},l,a,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h1",{id:"tournamentengine-api-reference"},"tournamentEngine API Reference"),Object(r.b)("h2",{id:"addcourt"},"addCourt"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"addcourts"},"addCourts"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"adddrawdefinition"},"addDrawDefinition"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"adddrawentries"},"addDrawEntries"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"addevent"},"addEvent"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"addevententries"},"addEventEntries"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"addparticipants"},"addParticipants"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"addparticipantstogrouping"},"addParticipantsToGrouping"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"addvenue"},"addVenue"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"alloweddrawtypes"},"allowedDrawTypes"),Object(r.b)("p",null,"No parameters."),Object(r.b)("p",null,"Returns an array of names of allowed Draw Types, if any applicable policies have been applied to the tournamentRecord."),Object(r.b)("hr",null),Object(r.b)("h2",{id:"allowedmatchupformats"},"allowedMatchUpFormats"),Object(r.b)("p",null,"No parameters."),Object(r.b)("p",null,"Returns an array of TODS matchUpFormat codes for allowed scoring formats, if any applicable policies have been applied to the tournamentRecord."),Object(r.b)("hr",null),Object(r.b)("h2",{id:"alleventmatchups"},"allEventMatchUps"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"alltournamentmatchups"},"allTournamentMatchUps"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"assigndrawposition"},"assignDrawPosition"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"assignmatchupcourt"},"assignMatchUpCourt"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"assignseedpositions"},"assignSeedPositions"),Object(r.b)("p",null,"Assign ",Object(r.b)("strong",{parentName:"p"},"participantIds")," to ",Object(r.b)("strong",{parentName:"p"},"seedNumbers")," within a target draw structure."),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-json"}),"Defaults to { stage: 'MAIN', stageSequence: 1 } if { structureId: undefined }\n")),Object(r.b)("p",null,"The structure of an ",Object(r.b)("strong",{parentName:"p"},Object(r.b)("em",{parentName:"strong"},"assignment object"))," is as follows:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-json"}),'{\n  "seedNumber": 1,\n  "seedValue": 1,\n  "participantId": "uuid-of-participant"\n}\n')),Object(r.b)("p",null,Object(r.b)("strong",{parentName:"p"},"seedNumber")," is unique while ",Object(r.b)("strong",{parentName:"p"},"seedValue")," can be any string representation."),Object(r.b)("p",null,"This allows seeds 5-8 to be visually represented as all having a seed value of '5' or '5-8'."),Object(r.b)("table",null,Object(r.b)("thead",{parentName:"table"},Object(r.b)("tr",{parentName:"thead"},Object(r.b)("th",Object(n.a)({parentName:"tr"},{align:"left"}),"Parameters"),Object(r.b)("th",Object(n.a)({parentName:"tr"},{align:"left"}),"Required"),Object(r.b)("th",Object(n.a)({parentName:"tr"},{align:"left"}),"Type"),Object(r.b)("th",Object(n.a)({parentName:"tr"},{align:"left"}),"Description"))),Object(r.b)("tbody",{parentName:"table"},Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"drawId"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Required"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"string"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Unique identifier for target drawDefinition")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"assignments"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Required"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"array"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Array of assignment objects")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"eventId"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Optional"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"string"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Not required; optimizes locating draw witthin tournamentRecord")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"structureId"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Optional"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"string"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Apply assignments to a specific structure, identified by structureId")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"stage"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Optional"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"string"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Locate target structure by stage; used together with stageSequence")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"stageSequence"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Optional"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"number"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Locate target structure by stageSequence; used together with stage")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"useExistingSeedLimits"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Optional"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"boolean"),Object(r.b)("td",Object(n.a)({parentName:"tr"},{align:"left"}),"Restrict ability to assign seedNumbers beyond established limit")))),Object(r.b)("hr",null),Object(r.b)("h2",{id:"assigntiematchupparticipantid"},"assignTieMatchUpParticipantId"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"bulkmatchupstatusupdate"},"bulkMatchUpStatusUpdate"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"checkinparticipant"},"checkInParticipant"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"checkoutparticipant"},"checkOutParticipant"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"deletecourt"},"deleteCourt"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"deletedrawdefinitions"},"deleteDrawDefinitions"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"deleteevententries"},"deleteEventEntries"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"deleteevents"},"deleteEvents"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"deleteparticipants"},"deleteParticipants"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"deletevenue"},"deleteVenue"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"deletevenues"},"deleteVenues"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"devcontext"},"devContext"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"eventmatchups"},"eventMatchUps"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"findmatchup"},"findMatchUp"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"findparticipant"},"findParticipant"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"findvenue"},"findVenue"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"flusherrors"},"flushErrors"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"generatedrawdefinition"},"generateDrawDefinition"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"generatefakeparticipants"},"generateFakeParticipants"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"generateteamsfromparticipantattribute"},"generateTeamsFromParticipantAttribute"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"getaudit"},"getAudit"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"getcourts"},"getCourts"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"getmatchupscheduledetails"},"getMatchUpScheduleDetails"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"getparticipantscaleitem"},"getParticipantScaleItem"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"getparticipantsigninstatus"},"getParticipantSignInStatus"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"getstate"},"getState"),Object(r.b)("p",null,"No parameters."),Object(r.b)("p",null,"Returns a deep copy of the current tournamentEngine state."),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"const { tournamentRecord } = tournamentEngine.getState();\n")),Object(r.b)("hr",null),Object(r.b)("h2",{id:"getvenues"},"getVenues"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"load"},"load"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"matchupactions"},"matchUpActions"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"mergeparticipants"},"mergeParticipants"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"modifycourtavailability"},"modifyCourtAvailability"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"modifyparticipant"},"modifyParticipant"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"newtournamentrecord"},"newTournamentRecord"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"participantscaleitem"},"participantScaleItem"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"participantssigninstatus"},"participantsSignInStatus"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"rankbyratings"},"rankByRatings"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"regeneratedrawdefinition"},"regenerateDrawDefinition"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"removedrawpositionassignment"},"removeDrawPositionAssignment"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"removeparticipantsfromallteams"},"removeParticipantsFromAllTeams"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"removeparticipantsfromgroup"},"removeParticipantsFromGroup"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"setdrawparticipantrepresentatives"},"setDrawParticipantRepresentatives"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"setmatchupstatus"},"setMatchUpStatus"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"setparticipantscaleitem"},"setParticipantScaleItem"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"setparticipantscaleitems"},"setParticipantScaleItems"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"setstate"},"setState"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"settournamentcategories"},"setTournamentCategories"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"settournamentenddate"},"setTournamentEndDate"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"settournamentname"},"setTournamentName"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"settournamentnotes"},"setTournamentNotes"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"settournamentstartdate"},"setTournamentStartDate"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"setvenueaddress"},"setVenueAddress"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"tournamentmatchups"},"tournamentMatchUps"),Object(r.b)("hr",null),Object(r.b)("h2",{id:"version"},"version"),Object(r.b)("p",null,"Returns NPM package version"),Object(r.b)("hr",null))}void 0!==s&&s&&s===Object(s)&&Object.isExtensible(s)&&!s.hasOwnProperty("__filemeta")&&Object.defineProperty(s,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/tournamentEngine/documentation/api.md"}}),s.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-tournament-engine-documentation-api-md-625c169ba6398e601f92.js.map