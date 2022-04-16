import structureTemplate from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';

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
    staggeredEntry,
    structureName,
    stage = MAIN,
    matchUpType,
    structureId,
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
    structureId: structureId || uuids?.pop(),
    structureName: structureName || MAIN,
    stageSequence,
    matchUpType,
    matchUps,
    stage,
  });

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

  return {
    structures: [mainStructure, consolationStructure],
    links: [link],
    ...SUCCESS,
  };
}
