"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3657],{7307:(e,t,r)=>{r.d(t,{Z:()=>c});var n=r(959),i=r(75),a=r(1981);const o=JSON.parse('{"monokai":{"scheme":"monokai","author":"wimer hazenberg (http://www.monokai.nl)","base00":"#272822","base01":"#383830","base02":"#49483e","base03":"#75715e","base04":"#a59f85","base05":"#f8f8f2","base06":"#f5f4f1","base07":"#f9f8f5","base08":"#f92672","base09":"#fd971f","base0A":"#f4bf75","base0B":"#a6e22e","base0C":"#a1efe4","base0D":"#66d9ef","base0E":"#ae81ff","base0F":"#cc6633"},"summerfruit":{"scheme":"summerfruit","author":"christopher corley (http://cscorley.github.io/)","base00":"#151515","base01":"#202020","base02":"#303030","base03":"#505050","base04":"#B0B0B0","base05":"#D0D0D0","base06":"#E0E0E0","base07":"#FFFFFF","base08":"#FF0086","base09":"#FD8900","base0A":"#ABA800","base0B":"#00C918","base0C":"#1faaaa","base0D":"#3777E6","base0E":"#AD00A1","base0F":"#cc6633"},"solarized":{"scheme":"solarized","author":"ethan schoonover (http://ethanschoonover.com/solarized)","base00":"#002b36","base01":"#073642","base02":"#586e75","base03":"#657b83","base04":"#839496","base05":"#93a1a1","base06":"#eee8d5","base07":"#fdf6e3","base08":"#dc322f","base09":"#cb4b16","base0A":"#b58900","base0B":"#859900","base0C":"#2aa198","base0D":"#268bd2","base0E":"#6c71c4","base0F":"#d33682"}}'),s=(e,t,r)=>{let{style:n}=e;return{style:{...n,color:Number.isNaN(r[0])||parseInt(r,10)%2?n.color:"#33F"}}},u=(e,t,r)=>{let{style:n}=e;return{style:{...n,fontWeight:r?"bold":n.textTransform}}},d=(e,t)=>{let{style:r}=e;return{style:{...r,borderRadius:"Boolean"===t?3:r.borderRadius}}},p=(e,t,r)=>{const a="object"==typeof t,o=a&&Object.values(t)[0],s="string"==typeof o&&"{"===o[0];let u;if(a){const e=Object.keys(t);2!==i.hC.intersection(e,["drawId","drawType"]).length||e.includes("drawRepresentativeIds")||(u="drawDefinition"),2!==i.hC.intersection(e,["entryPosition","entryStatus"]).length||e.includes("entryStageSequence")||(u="entry"),3!==i.hC.intersection(e,["eventId","sortOrder","notBeforeTime"]).length||e.includes("tennisOfficialIds")?2!==i.hC.intersection(e,["eventId","eventName"]).length||e.includes("tennisOfficialIds")||(u="event"):u="round",2===i.hC.intersection(e,["flightNumber","drawId"]).length&&(u="flight"),2===i.hC.intersection(e,["name","value"]).length&&(u="extension"),2!==i.hC.intersection(e,["linkType","source"]).length||e.includes("linkCondition")||(u="link"),2!==i.hC.intersection(e,["matchUpId","drawPositions"]).length||e.includes("surfaceCategory")||(u="matchUp"),2===i.hC.intersection(e,["drawPosition","participantId","bye"]).length&&(u="positionAssignment"),2!==i.hC.intersection(e,["courtId","dateAvailability"]).length||e.includes("altitude")||(u="court"),2!==i.hC.intersection(e,["participantId","participantName"]).length||e.includes("onlineResources")||(u="participant"),2===i.hC.intersection(e,["structureId","structureName"]).length&&(u="structure"),2!==i.hC.intersection(e,["venueId","courts"]).length||e.includes("venueOtherIds")||(u="venue")}return n.createElement("span",null,u||(s?e:r))},l=e=>{return"string"==typeof(t=e)&&t.length>2&&"{"===t[1]?(e=>{try{const t=JSON.parse(JSON.parse(e)),r="true"===t.required?"":"? ",n="true"===t.array?"[]":"";return`${r}: ${["any","boolean","number","string"].includes(t.type)&&t.type||"object"===t.type&&t.object||"enum"===t.type?`enum ${t.enum}`:""}${n}${t.note?` \\\\ ${t.note}`:""}`}catch(t){return""}})(e):"string"==typeof e&&e.length>40?e.slice(0,40)+"...":e;var t},y=e=>{let[t]=e;return n.createElement("strong",null,t)},c=e=>{let{colorScheme:t="summerfruit",sortObjectKeys:r=!0,invertTheme:i=!0,expandRoot:c=!0,expandToLevel:m=1,hideRoot:f=!1,root:q="root",data:b}=e;return n.createElement("div",{style:{marginBottom:"1em"}},n.createElement(a.L,{theme:{valueLabel:s,nestedNodeLabel:u,extend:o[t],value:d},shouldExpandNode:(e,t,r)=>!!c&&(("object"!=typeof t||!t._typeDef)&&(r<m||void 0)),sortObjectKeys:r,getItemString:p,labelRenderer:y,valueRenderer:l,invertTheme:i,hideRoot:f,keyPath:[q],data:b}))}},5127:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>_,contentTitle:()=>H,default:()=>X,frontMatter:()=>V,metadata:()=>z,toc:()=>W});var n=r(8957),i=(r(959),r(7942)),a=r(7307);const o='{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',s={addressLine1:o,addressLine2:o,addressLine3:o,addressName:o,addressType:'{\\"type\\":\\"enum\\",\\"enum\\":\\"\\",\\"required\\":\\"false\\"}',city:o,countryCode:'{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',latitude:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"11.583331 or 11\xb034\'59.99 N\\"}',longitude:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"165.333332 or 165\xb019\'60.00 E\\"}',postalCode:o,state:o,timeZone:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"IANA Code\\"}'},u={bookings:'{\\"type\\":\\"object\\",\\"object\\":\\"booking\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',date:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',endTime:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"24 Hour format: \'00:00\'\\"}',startTime:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"24 Hour format: \'00:00\'\\"}'},d={ageBeganTennis:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',ageTurnedPro:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',birthCountryCode:'{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',coachId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',doublePlayingHand:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',height:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',heightUnit:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',organisationIds:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',placeOfResidence:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',playingHand:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',residenceCountryCode:'{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',weight:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',weightUnit:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}'},p={bookingType:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"e.g. \'practice\', \'maintenance\'\\"}',endTime:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"24 Hour format: \'00:00\'\\"}',startTime:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"24 Hour format: \'00:00\'\\"}'},l={ageMax:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',ageMaxDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',ageMin:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',ageMinDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',ageCategoryCode:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. U12, 12U, C50-70\\"}',ballType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',categoryName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',ratingMax:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',ratingMin:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',ratingType:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ratings provider\\"}',subType:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. ADULT, JUNIOR, SENIOR\\"}',type:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. AGE, RATING, BOTH\\"}'},y={collectionId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\\"}',collectionPosition:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\",\\"note\\":\\"\\"}'},c={collectionId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',collectionName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',collectionGroupNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',collectionValue:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',collectionValueProfiles:'{\\"type\\":\\"object\\",\\"object\\":\\"collectionValueProfiles\\",\\"array\\":\\"true\\",\\"required\\":\\"true\\"}',matchUpCount:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\"}',matchUpFormat:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',matchUpType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\",\\"note\\":\\"SINGLES, DOUBLES, or TEAM\\"}',matchUpValue:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',scoreValue:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',setValue:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',winCriteria:'{\\"type\\":\\"object\\",\\"object\\":\\"winCriteria\\",\\"required\\":\\"true\\"}'},m={groupNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\"}',groupName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}'},f=[{collectionPosition:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\"}',matchUpValue:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\"}'}],q={createdAt:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ISO 8601 Date/time string\\"}',extensions:'{\\"type\\":\\"object\\",\\"object\\":\\"extension\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',isMock:'{\\"type\\":\\"boolean\\",\\"required\\":\\"false\\",\\"note\\":\\"flag for test data\\"}',notes:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',timeItems:'{\\"type\\":\\"object\\",\\"object\\":\\"timeItem\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',updatedAt:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ISO 8601 Date/time string\\"}'},b={altitude:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',courtId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',courtName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',courtDimensions:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',dateAvailability:'{\\"type\\":\\"object\\",\\"object\\":\\"availability\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',latitude:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',longitude:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',onlineResources:'{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',pace:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',surfaceCategory:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',surfaceType:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ITF recognized type\\"}',surfacedDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}'},g={automated:'{\\"type\\":\\"boolean\\",\\"required\\":\\"false\\"}',drawId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',drawName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',drawOrder:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',drawRepresentativeIds:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"participantId array\\"}',drawStatus:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\"}',drawType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',entries:'{\\"type\\":\\"object\\",\\"object\\":\\"entry\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',endDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',links:'{\\"type\\":\\"object\\",\\"object\\":\\"link\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',matchUps:'{\\"type\\":\\"object\\",\\"object\\":\\"matchUp\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',matchUpFormat:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',startDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',structures:'{\\"type\\":\\"object\\",\\"object\\":\\"structure\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',tieFormat:'{\\"type\\":\\"object\\",\\"object\\":\\"tieFormat\\",\\"required\\":\\"false\\"}'},h={entryId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"id unique within tournament\\"}',entryPosition:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"unique within status group\\"}',entryStage:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"QUALIFYING or MAIN\\"}',entryStageSequence:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. in progressive qualifying\\"}',entryStatus:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. DIRECT_ACCEPTANCE, ALTERNATE\\"}',participantId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}'},T={category:'{\\"type\\":\\"object\\",\\"object\\":\\"category\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',discipline:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',drawDefinitions:'{\\"type\\":\\"object\\",\\"object\\":\\"drawDefinition\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',entries:'{\\"type\\":\\"object\\",\\"object\\":\\"entry\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',endDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',eventId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',eventName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',eventRank:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',eventLevel:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',eventType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\",\\"note\\":\\"SINGLES, DOUBLES, or TEAM\\"}',gender:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',indoorOutdoor:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',links:'{\\"type\\":\\"object\\",\\"object\\":\\"link\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',matchUpFormat:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',startDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',surfaceCategory:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',tennisOfficialIds:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"participantId array\\"}',tieFormat:'{\\"type\\":\\"object\\",\\"object\\":\\"tieFormat\\",\\"required\\":\\"false\\"}',wheelchairClass:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}'},j={description:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',name:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',value:'{\\"type\\":\\"any\\",\\"required\\":\\"true\\"}'},R={offset:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\",\\"note\\":\\"# of positions to skip before beginning\\"}',interleave:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\",\\"note\\":\\"# of positions to skip between fed positions\\"}'},S={linkCondition:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. FIRST_MATCHUP\\"}',linkType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\",\\"note\\":\\"WINNER or LOSER\\"}',source:'{\\"type\\":\\"object\\",\\"object\\":\\"linkSource\\",\\"required\\":\\"true\\"}',target:'{\\"type\\":\\"object\\",\\"object\\":\\"linkTarget\\",\\"required\\":\\"true\\"}'},v={drawId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"if target is in different draw\\"}',finishingPositions:'{\\"type\\":\\"number\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"round robin final positions\\"}',roundNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\",\\"note\\":\\"if target is in different draw\\"}',structureId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"target structure\\"}'},I={drawId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"if target is in different draw\\"}',feedProfile:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\",\\"note\\":\\"e.g. TOP_DOWN, BOTTOM_UP\\"}',groupedOrder:'{\\"type\\":\\"number\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"relates to fed positions\\"}',positionInterleave:'{\\"type\\":\\"object\\",\\"object\\":\\"interleave\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. double elimination backdraw\\"}',roundNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\",\\"note\\":\\"if target is in different draw\\"}',structureId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"target structure\\"}'},N={collectionId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"only applies to tieMatchUps\\"}',collectionPosition:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"only applies to tieMatchUps\\"}',drawPositions:'{\\"type\\":\\"number\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',endDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',indoorOutdoor:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',finishingPositionRange:'{\\"type\\":\\"object\\",\\"object\\":\\"positionRange\\",\\"required\\":\\"false\\"}',finishingRound:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',loserMatchUpId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',matchUpDuration:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',matchUpFormat:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',matchUpId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',matchUpStatus:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\"}',matchUpStatusCodes:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"provider specific\\"}',matchUpType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\",\\"note\\":\\"SINGLES, DOUBLES, or TEAM\\"}',orderOfFinish:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',roundName:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',roundNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',roundPosition:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',score:'{\\"type\\":\\"object\\",\\"object\\":\\"score\\",\\"required\\":\\"false\\"}',sides:'{\\"type\\":\\"object\\",\\"object\\":\\"side\\",\\"required\\":\\"false\\"}',startDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',surfaceCategory:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',tieFormat:'{\\"type\\":\\"object\\",\\"object\\":\\"tieFormat\\",\\"required\\":\\"false\\"}',tieMatchUps:'{\\"type\\":\\"object\\",\\"object\\":\\"matchUp\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',winningSide:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"1 or 2\\"}',winnerMatchUpId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}'},O={identifier:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. resource URL, email address\\"}',name:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',provider:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. Twitter\\"}',resourceSubType:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. PDF, IMAGE, WEBSITE\\"}',resourceType:'{\\"type\\":\\"enum\\",\\"enum\\":\\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. URL, EMAIL, SOCIAL_MEDIA\\"}'},k={contacts:'{\\"type\\":\\"object\\",\\"object\\":\\"contact\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',individualParticipantIds:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"participantIds in TEAM, GROUP, or PAIR\\"}',onlineResources:'{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',participantId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',participantName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',participantOtherName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',participantRole:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. COMPETITOR, OFFICIAL, COACH\\"}',participantRoleResponsibilities:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',participantStatus:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',participantType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. INDIVIDUAL, PAIR, TEAM, GROUP\\"}',penalties:'{\\"type\\":\\"object\\",\\"object\\":\\"penalty\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',person:'{\\"type\\":\\"object\\",\\"object\\":\\"person\\",\\"required\\":\\"false\\"}',representing:'{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',teamId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"if participant is TEAM; provider specific\\"}'},D={issuedAt:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ISO 8601 Date/time string\\"}',matchUpId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',penaltyCode:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"provider specific\\"}',penaltyId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"unique identifier within tournament\\"}',penaltyType:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',refereeParticipantId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"participantId of official\\"}'},x={addresses:'{\\"type\\":\\"object\\",\\"object\\":\\"address\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',birthDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',biographicalInformation:'{\\"type\\":\\"object\\",\\"object\\":\\"biographicalInformation\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',contacts:'{\\"type\\":\\"object\\",\\"object\\":\\"contact\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',nationalityCode:'{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',nativeFamilyName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',nativeGivenName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',onlineResources:'{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',otherNames:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',parentOrganisationId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',passportFamilyName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',passportGivenName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',personId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',personOtherIds:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',previousNames:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',sex:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',standardFamilyName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',standardGivenName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',tennisId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',wheelchair:'{\\"type\\":\\"boolean\\",\\"required\\":\\"false\\"}'},w={bye:'{\\"type\\":\\"boolean\\",\\"required\\":\\"false\\"}',drawPosition:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\"}',participantId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',qualifier:'{\\"type\\":\\"boolean\\",\\"required\\":\\"false\\"}'},C={loser:'{\\"type\\":\\"number\\",\\"array\\":\\"true\\",\\"required\\":\\"true\\",\\"note\\":\\"e.g. [3, 4] would be the result of a SemiFinal loss\\"}',winner:'{\\"type\\":\\"number\\",\\"array\\":\\"true\\",\\"required\\":\\"true\\",\\"note\\":\\"e.g. [1, 2] would be the result of a SemiFinal win\\"}'},M={entriesClose:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',entriesOpen:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',withdrawalDeadline:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}'},Y={scoreStringSide1:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"score from sideNumber 1 perspective\\"}',scoreStringSide2:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"score from sideNumber 2 perspective\\"}',sets:'{\\"type\\":\\"object\\",\\"array\\":\\"true\\",\\"object\\":\\"set\\",\\"required\\":\\"false\\"}'},A={participantId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',seedNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\",\\"note\\":\\"unique integer\\"}',seedValue:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. 5-8\\"}'},U={games:'{\\"type\\":\\"object\\",\\"array\\":\\"true\\",\\"object\\":\\"game\\",\\"required\\":\\"false\\"}',setDuration:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"duration in minutes\\"}',setNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',side1Score:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',side1PointScore:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',side1TiebreakScore:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',side2Score:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',side2PointScore:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',side2TiebreakScore:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',winningSide:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"1 or 2\\"}'},E={lineUp:'{\\"type\\":\\"object\\",\\"array\\":\\"true\\",\\"object\\":\\"teamCompetitior\\",\\"required\\":\\"false\\"}',participantId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',sideNumber:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"1 or 2\\"}'},F={finishingPosition:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. ROUND_OUTCOME, WIN_RATION\\"}',matchUpFormat:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',matchUps:'{\\"type\\":\\"object\\",\\"object\\":\\"matchUp\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',positionAssignments:'{\\"type\\":\\"object\\",\\"object\\":\\"positionAssignment\\",\\"required\\":\\"false\\"}',seedAssignments:'{\\"type\\":\\"object\\",\\"object\\":\\"seedAssignment\\",\\"required\\":\\"false\\"}',seedLimit:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"Maximum # allowed seeds\\"}',seedingProfile:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. WATERFALL for round robin structures\\"}',stage:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. MAIN, CONSOLATION\\"}',stageSequence:'{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',structureAbbreviation:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"used in construction of roundNames\\"}',structureId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"id unique within drawDefinition\\"}',structureName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. NORTH, SOUTH for Compass Draws\\"}',structures:'{\\"type\\":\\"object\\",\\"object\\":\\"structure\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"Contained structures, e.g. round robin groups\\"}',structureType:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"CONTAINER or ITEM\\"}',tieFormat:'{\\"type\\":\\"object\\",\\"object\\":\\"tieFormat\\",\\"required\\":\\"false\\"}'},J={collectionAssignments:'{\\"type\\":\\"object\\",\\"array\\":\\"true\\",\\"object\\":\\"collectionAssignment\\",\\"required\\":\\"false\\"}',participantId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"must be an individual participantId\\"}'},Z={collectionDefinitions:'{\\"type\\":\\"object\\",\\"object\\":\\"collectionDefinition\\",\\"array\\":\\"true\\",\\"required\\":\\"true\\"}',collectionGroups:'{\\"type\\":\\"object\\",\\"object\\":\\"collectionGroup\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',tieFormatName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',winCriteria:'{\\"type\\":\\"object\\",\\"object\\":\\"winCriteria\\",\\"required\\":\\"true\\"}'},P={itemDate:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ISO 8601 Date/time string\\"}',itemSubTypes:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',itemType:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',itemValue:'{\\"type\\":\\"any\\",\\"required\\":\\"false\\"}'},L={endDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',events:'{\\"type\\":\\"object\\",\\"object\\":\\"event\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',formalName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',hostCountryCode:'{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',indoorOutdoor:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',localTimeZone:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',matchUps:'{\\"type\\":\\"object\\",\\"object\\":\\"matchUp\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',onlineResources:'{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',parentOrganizationid:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',participants:'{\\"type\\":\\"object\\",\\"object\\":\\"participant\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',promotionalName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',registrationProfile:'{\\"type\\":\\"object\\",\\"object\\":\\"registrationProfile\\",\\"required\\":\\"false\\",\\"link\\":\\"true\\"}',season:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. \'Fall 2020\'\\"}',startDate:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',surfaceCategory:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',totalPrizeMoney:'{\\"type\\":\\"object\\",\\"object\\":\\"prizeMoney\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',tournamentCategories:'{\\"type\\":\\"object\\",\\"object\\":\\"category\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',tournamentGroups:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. [\'Grand Slam\']\\"}',tournamentId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',tournamentLevel:'{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',tournamentName:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',tournamentOtherIds:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',tournamentRank:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"unique to provider\\"}',venues:'{\\"type\\":\\"object\\",\\"object\\":\\"venue\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}'},B={addresses:'{\\"type\\":\\"object\\",\\"object\\":\\"address\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',contacts:'{\\"type\\":\\"object\\",\\"object\\":\\"contact\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',courts:'{\\"type\\":\\"object\\",\\"object\\":\\"court\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',onlineResources:'{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',parentOrganisationId:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',roles:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. courts, sign-in, hospitality\\"}',subVenueIds:'{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',venueAbbreviation:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',venueId:'{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',venueName:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',venueOtherIds:'{\\"type\\":\\"object\\",\\"object\\":\\"unifiedVenueId\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',venueType:'{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}'},G={valueGoal:'{\\"type\\":\\"number\\",\\"required\\":\\"true\\",\\"note\\":\\"Value required to win the matchUp\\"}'},V={title:"Type Definitions"},H=void 0,z={unversionedId:"types/typedefs",id:"types/typedefs",title:"Type Definitions",description:"Overview",source:"@site/docs/types/typedefs.mdx",sourceDirName:"types",slug:"/types/typedefs",permalink:"/tods-competition-factory/docs/types/typedefs",draft:!1,tags:[],version:"current",frontMatter:{title:"Type Definitions"},sidebar:"docs",previous:{title:"Constants",permalink:"/tods-competition-factory/docs/constants"},next:{title:"Age Category Codes",permalink:"/tods-competition-factory/docs/codes/age-category"}},_={},W=[{value:"Overview",id:"overview",level:2},{value:"Common",id:"common",level:3},{value:"Generic",id:"generic",level:3},{value:"tournament",id:"tournament",level:3},{value:"participant",id:"participant",level:3},{value:"event",id:"event",level:3},{value:"drawDefinition",id:"drawdefinition",level:3},{value:"matchUp",id:"matchup",level:3},{value:"tieFormat",id:"tieformat",level:3},{value:"venue",id:"venue",level:3}],$={toc:W},K="wrapper";function X(e){let{components:t,...r}=e;return(0,i.kt)(K,(0,n.Z)({},$,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"overview"},"Overview"),(0,i.kt)("h3",{id:"common"},"Common"),(0,i.kt)("p",null,"Elements that may occur on any TODS object."),(0,i.kt)(a.Z,{hideRoot:!0,data:q,root:"common",mdxType:"RenderJSON"}),(0,i.kt)("p",null,"Object definitions:"),(0,i.kt)(a.Z,{expandRoot:!1,data:j,root:"extension",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:P,root:"timeItem",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"generic"},"Generic"),(0,i.kt)("p",null,"Elements that occur on several TODS objects."),(0,i.kt)(a.Z,{expandRoot:!1,data:s,root:"address",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:l,root:"category",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:h,root:"entry",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:O,root:"onlineResource",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tournament"},"tournament"),(0,i.kt)(a.Z,{expandRoot:!1,data:L,root:"tournament",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:M,root:"registrationProfile",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"participant"},"participant"),(0,i.kt)(a.Z,{expandRoot:!1,data:k,root:"participant",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:D,root:"penalty",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:x,root:"person",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:d,root:"biographicalInformation",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"event"},"event"),(0,i.kt)(a.Z,{expandRoot:!1,data:T,root:"event",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"drawdefinition"},"drawDefinition"),(0,i.kt)(a.Z,{expandRoot:!1,data:g,root:"drawDefinition",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:F,root:"structure",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:A,root:"seedAssignment",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:w,root:"positionAssignment",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:S,root:"link",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:v,root:"linkSource",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:I,root:"linkTarget",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:R,root:"interleave",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"matchup"},"matchUp"),(0,i.kt)("p",null,"A ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUp")," is an object which contains the details of an encounter between two tournament ",(0,i.kt)("inlineCode",{parentName:"p"},"participants"),", which can be INDIVIDUALS, PAIRS, or TEAMS.\nThe term ",(0,i.kt)("inlineCode",{parentName:"p"},"matchUp"),' was chosen to differentiate from other interpretations, particularly in the context of software development,\nof the more traditional term "match". Other descriptive terms such as "face off" and "throw down" were never seriously considered.'),(0,i.kt)(a.Z,{expandRoot:!1,data:N,root:"matchUp",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:C,root:"positionRange",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:Y,root:"score",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:U,root:"set",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:E,root:"side",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:J,root:"teamCompetitor",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:y,root:"collectionAssignment",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tieformat"},"tieFormat"),(0,i.kt)("p",null,"See ",(0,i.kt)("a",{parentName:"p",href:"../concepts/tieFormat"},"tieFormats Explanation"),"."),(0,i.kt)(a.Z,{expandRoot:!1,data:Z,root:"tieFormat",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:c,root:"collectionDefinition",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:m,root:"collectionGroup",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:f,root:"collectionValueProfiles",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:G,root:"winCriteria",mdxType:"RenderJSON"}),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"venue"},"venue"),(0,i.kt)(a.Z,{expandRoot:!1,data:B,root:"venue",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:b,root:"court",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:u,root:"availability",mdxType:"RenderJSON"}),(0,i.kt)(a.Z,{expandRoot:!1,data:p,root:"booking",mdxType:"RenderJSON"}))}X.isMDXComponent=!0}}]);