import { getStageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import {
  feedInMatchUps,
  treeMatchUps,
} from '../../drawEngine/generators/eliminationTree';

import structureTemplate from '../../drawEngine/generators/structureTemplate';
import {
  MAIN,
  CONSOLATION,
  TOP_DOWN,
  LOSER,
} from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function firstRoundLoserConsolation(params) {
  let { drawSize, consolationStructureName } = params;
  const {
    uuids,
    matchUpType,
    stage = MAIN,
    structureName,
    drawDefinition,
    staggeredEntry,
    stageSequence = 1,
    finishingPositionOffset = 0,
  } = params;

  drawSize = drawSize || getStageDrawPositionsCount({ stage, drawDefinition });

  const { matchUps } = staggeredEntry
    ? feedInMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids })
    : treeMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids });
  const mainStructure = structureTemplate({
    stage,
    matchUps,
    matchUpType,
    stageSequence,
    structureId: uuids?.pop(),
    structureName: structureName || MAIN,
  });

  if (drawDefinition) {
    drawDefinition.structures.push(mainStructure);
  }

  const consolationDrawPositions = drawSize / 2;

  const { matchUps: consolationMatchUps } = treeMatchUps({
    matchUpType,
    drawSize: consolationDrawPositions,
    finishingPositionOffset: finishingPositionOffset + consolationDrawPositions,
  });

  consolationStructureName =
    consolationStructureName ||
    (structureName ? `${structureName} ${CONSOLATION}` : CONSOLATION);

  const consolationStructure = structureTemplate({
    matchUpType,
    stageSequence: 1,
    stage: CONSOLATION,
    structureId: uuids?.pop(),
    matchUps: consolationMatchUps,
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
    {
      link,
      mainStructure,
      consolationStructure,
      links: drawDefinition?.links,
    },
    SUCCESS
  );
}
