(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{Begy:function(e,t,r){"use strict";r.r(t),r.d(t,"_frontmatter",(function(){return s})),r.d(t,"default",(function(){return m}));var n=r("Fcif"),a=r("+I+c"),i=r("/FXl"),b=r("TjRS"),s=(r("aD51"),{});void 0!==s&&s&&s===Object(s)&&Object.isExtensible(s)&&!s.hasOwnProperty("__filemeta")&&Object.defineProperty(s,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/drawEngine/documentation/attributeGlossary.md"}});var o={_frontmatter:s},c=b.a;function m(e){var t=e.components,r=Object(a.a)(e,["components"]);return Object(i.b)(c,Object(n.a)({},o,r,{components:t,mdxType:"MDXLayout"}),Object(i.b)("h1",{id:"drawdefinition-attributes"},"drawDefinition Attributes"),Object(i.b)("h2",{id:"drawid"},"drawId"),Object(i.b)("p",null,"a unique identifier"),Object(i.b)("h2",{id:"entryprofile"},"entryProfile"),Object(i.b)("p",null,"defines attributes for each stage type (QUALIFYING, MAIN, CONSOLATION)"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"drawSize"))),Object(i.b)("li",{parentName:"ul"},"number of ",Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"wildcardsCount"))," to permit"),Object(i.b)("li",{parentName:"ul"},"whether ",Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"alternates"))," are allowed")),Object(i.b)("p",null,"attributes provide constraints on generation and manipulation of draw structures"),Object(i.b)("h2",{id:"entries"},"entries"),Object(i.b)("p",null,"an ",Object(i.b)("strong",{parentName:"p"},Object(i.b)("em",{parentName:"strong"},"entry"))," contains participantIds and participant entry details including entered stage"),Object(i.b)("h2",{id:"strutures"},"strutures"),Object(i.b)("p",null,"structures contain matchUps. all structures within a drawDefinition must be connected by links"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"structureId"))," - ",Object(i.b)("em",{parentName:"li"},"required")," - unique identifier"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"structureName"))," - ",Object(i.b)("em",{parentName:"li"},"optional"),' - e.g. "EAST"'),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"structureType"))," - ",Object(i.b)("em",{parentName:"li"},"optional")," - CONTAINER or ITEM; for grouped structures such as ROUND_ROBIN where there is no movement (linkage) between ITEMS but where the outcomes of the contained structures may be linked to other structures"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"stage"))," - ",Object(i.b)("em",{parentName:"li"},"required")," - QUALIFYING, MAIN, or CONSOLATION"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"stageSequence"))," - ",Object(i.b)("em",{parentName:"li"},"optional")," - structural link depth within a stage"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"finishingPosition"))," - ",Object(i.b)("em",{parentName:"li"},"required"),' - how finishing position is determined, e.g. "ROUND_OUTCOME" or "WIN_RATIO"'),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"entries"))," - ",Object(i.b)("em",{parentName:"li"},"required")," - array"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"matchUps"))," - ",Object(i.b)("em",{parentName:"li"},"required")," - array")),Object(i.b)("hr",null),Object(i.b)("h2",{id:"positionassignments"},"positionAssignments"),Object(i.b)("p",null,"array of drawPositions present in structure matchUps and participantIds, once assigned. ",Object(i.b)("em",{parentName:"p"},"matchUps")," do not need to contain participant details (until TODS exports are generated)"),Object(i.b)("h2",{id:"matchups"},"matchUps"),Object(i.b)("p",null,"an encounter between two participants; a participant may be an individual, a pair, or a team"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"matchUpId"))," - ",Object(i.b)("em",{parentName:"li"},"required")," - unique identifier"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"roundNumber"))," - ",Object(i.b)("em",{parentName:"li"},"required")),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"roundPosition"))," - ",Object(i.b)("em",{parentName:"li"},"required for elimination structures")," - not relevant in ",Object(i.b)("em",{parentName:"li"},"roundRobin")," structures"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"drawPositions"))," - ",Object(i.b)("em",{parentName:"li"},"required")," - used to reference the participants who participate in the matchUp"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"finishingRound"))," - ",Object(i.b)("em",{parentName:"li"},"optional")," - relevant only for elimination structures; defines depth from final round"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"finishingPositionRange"))," - ",Object(i.b)("em",{parentName:"li"},"optional")," - for convenience in determining finishingPositions and either participant progression across structure links, or for point allocation. a range is given for matchUp ",Object(i.b)("em",{parentName:"li"},"winner")," and ",Object(i.b)("em",{parentName:"li"},"loser"))),Object(i.b)("h2",{id:"links"},"links"),Object(i.b)("p",null,"a ",Object(i.b)("strong",{parentName:"p"},"link")," defines the movement of participants between structures within a draw. ",Object(i.b)("strong",{parentName:"p"},"links")," always have ",Object(i.b)("em",{parentName:"p"},"source")," and ",Object(i.b)("em",{parentName:"p"},"target")," structures"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"structureId"))," - ",Object(i.b)("em",{parentName:"li"},"required")),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"roundNumber"))," - ",Object(i.b)("em",{parentName:"li"},"required for targets and for elimination source structures")," - determines the finishing round within the source structure for participants who will progress across the link and the entry round into the target structure (FEED_IN structures)"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"finishingPositions"))," - ",Object(i.b)("em",{parentName:"li"},"required for round robin source structures")," - determines which finishing drawPositions within a round robin group will progress across the link"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"feedProfile"))," - ",Object(i.b)("em",{parentName:"li"},"required for target structures")," - determines the method by which participants will be placed in the target structure")),Object(i.b)("h2",{id:"feedprofile"},"feedProfile"),Object(i.b)("p",null,"method by which participants move across links into target structures"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"DRAW"))," - drawPositions within target structure will be drawn; seeding may be considered"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"TOP_DOWN"))," - drawPositions within target structure are assigned starting with the first ",Object(i.b)("em",{parentName:"li"},"roundPosition")," of the ",Object(i.b)("em",{parentName:"li"},"roundNumber")," of the target structure"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"BOTTOM_UP"))," - drawPositions within target structure are assigned starting at the final ",Object(i.b)("em",{parentName:"li"},"roundPosition")," of the ",Object(i.b)("em",{parentName:"li"},"roundNumber")," of the target structure"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"RANDOM"))," - drawPositions within target structure are assigned randomly"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},Object(i.b)("em",{parentName:"strong"},"LOSS_POSITION"))," - drawPositions within target structure are equivalent to the roundPosition when the loss occurred for the directed participant")),Object(i.b)("p",null,"LOSS_POSITION addresses the scenario where a first matchUp loss occurs after advancement due to BYE or WALKOVER"))}void 0!==m&&m&&m===Object(m)&&Object.isExtensible(m)&&!m.hasOwnProperty("__filemeta")&&Object.defineProperty(m,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/drawEngine/documentation/attributeGlossary.md"}}),m.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-draw-engine-documentation-attribute-glossary-md-b4ad321434cfe8c80105.js.map