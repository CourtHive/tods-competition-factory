import { stageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import { treeMatchUps } from '../../drawEngine/generators/eliminationTree';

import structureTemplate from '../../drawEngine/generators/structureTemplate';
import {
  MAIN,
  CONSOLATION,
  TOP_DOWN,
  LOSER,
} from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function firstMatchLoserConsolation(props) {
  let { drawSize, consolationStructureName } = props;
  const {
    stage = MAIN,
    structureName,
    drawDefinition,
    stageSequence = 1,
    finishingPositionOffset,
  } = props;

  drawSize = drawSize || stageDrawPositionsCount({ stage, drawDefinition });
  const { matchUps } = treeMatchUps({ drawSize, finishingPositionOffset });
  const mainStructure = structureTemplate({
    stage,
    matchUps,
    stageSequence,
    structureName: structureName || MAIN,
  });

  if (drawDefinition) {
    drawDefinition.structures.push(mainStructure);
  }

  const consolationDrawPositions = drawSize / 2;

  const { matchUps: consolationMatchUps } = treeMatchUps({
    drawSize: consolationDrawPositions,
    finishingPositionOffset: consolationDrawPositions,
  });

  consolationStructureName =
    consolationStructureName ||
    (structureName ? `${structureName} ${CONSOLATION}` : CONSOLATION);

  const consolationStructure = structureTemplate({
    stage: CONSOLATION,
    matchUps: consolationMatchUps,
    stageSequence: 1,
    structureName: consolationStructureName,
  });

  if (drawDefinition) {
    drawDefinition.structures.push(consolationStructure);
  }

  const link = {
    linkType: LOSER,
    source: {
      roundNumber: 1,
      structureId: mainStructure.structureId,
    },
    target: {
      roundNumber: 1,
      feedProfile: TOP_DOWN,
      structureId: consolationStructure.structureId,
    },
  };

  if (drawDefinition) {
    drawDefinition.links.push(link);
  }

  return Object.assign(
    { mainStructure, consolationStructure, link, links: drawDefinition?.links },
    SUCCESS
  );
}
