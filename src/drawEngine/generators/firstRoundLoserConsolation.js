import structureTemplate from '../../drawEngine/generators/structureTemplate';
import {
  feedInMatchUps,
  treeMatchUps,
} from '../../drawEngine/generators/eliminationTree';

import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  CONSOLATION,
  TOP_DOWN,
  LOSER,
} from '../../constants/drawDefinitionConstants';

export function firstRoundLoserConsolation(params) {
  const {
    finishingPositionOffset = 0,
    stageSequence = 1,
    drawDefinition,
    staggeredEntry,
    structureName,
    stage = MAIN,
    matchUpType,
    idPrefix,
    drawSize,
    isMock,
    uuids,
  } = params;

  const mainParams = {
    finishingPositionOffset,
    matchUpType,
    drawSize,
    idPrefix,
    isMock,
    uuids,
  };
  const { matchUps } = staggeredEntry
    ? feedInMatchUps(mainParams)
    : treeMatchUps(mainParams);

  const mainStructure = structureTemplate({
    structureName: structureName || MAIN,
    structureId: uuids?.pop(),
    stageSequence,
    matchUpType,
    matchUps,
    stage,
  });

  if (drawDefinition) {
    drawDefinition.structures.push(mainStructure);
  }

  const consolationDrawPositions = drawSize / 2;

  const { matchUps: consolationMatchUps } = treeMatchUps({
    finishingPositionOffset: finishingPositionOffset + consolationDrawPositions,
    idPrefix: idPrefix && `${idPrefix}-c`,
    drawSize: consolationDrawPositions,
    matchUpType,
    isMock,
  });

  const consolationStructureName =
    params.consolationStructureName ||
    (structureName ? `${structureName} ${CONSOLATION}` : CONSOLATION);

  const consolationStructure = structureTemplate({
    structureName: consolationStructureName,
    matchUps: consolationMatchUps,
    structureId: uuids?.pop(),
    stage: CONSOLATION,
    stageSequence: 1,
    matchUpType,
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
      structures: [mainStructure, consolationStructure],
      links: drawDefinition?.links,
    },
    SUCCESS
  );
}
