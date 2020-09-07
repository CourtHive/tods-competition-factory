import { doubleEliminationLinks } from 'src/drawEngine/generators/doubleEliminationLinks';
import { treeMatchUps, feedInMatchUps } from 'src/drawEngine/generators/eliminationTree';
import { structureTemplate } from 'src/drawEngine/generators/structureTemplate';
import {
  MAIN, BACKDRAW
} from 'src/constants/drawDefinitionConstants';
import { SUCCESS } from 'src/constants/resultConstants';

export function generateDoubleElimination({
  structureName,
  drawDefinition,
  drawSize
}) {
 
  // feedIn MAIN structure needs 1st round feed and final round feed
  const { matchUps, } = feedInMatchUps({
    drawSize: drawSize + 1,
    linkFedFinishingRoundNumbers: [1]
  });
  const mainStructure = structureTemplate({
    matchUps,
    structureName: structureName || MAIN,
    stageSequence: 1,
    stage: MAIN
  });

  drawDefinition.structures.push(mainStructure);

  const consolationDrawPositions = drawSize / 2;

  const {
    matchUps: consolationMatchUps,
  } = feedInMatchUps({
    isConsolation: true,
    drawSize: drawSize - 1,
    finishingPositionOffset: consolationDrawPositions
  });

  const consolationStructure = structureTemplate({
    matchUps: consolationMatchUps,
    stage: MAIN,
    structureName: BACKDRAW,
    stageSequence: 2
  });

  drawDefinition.structures.push(consolationStructure);

  const {
    matchUps: deciderMatchUps
  } = treeMatchUps({ drawSize: 2 });
  const deciderStructure = structureTemplate({
    matchUps: deciderMatchUps,
    stage: MAIN,
    structureName: 'DECIDER',
    stageSequence: 3
  });
  
  drawDefinition.structures.push(deciderStructure);
  
  const links = doubleEliminationLinks({
    mainStructure,
    consolationStructure,
    deciderStructure
  });

  drawDefinition.links = drawDefinition.links.concat(...links);

  return Object.assign({
    structures: drawDefinition.structures,
    links: drawDefinition.links
  }, SUCCESS);
};
