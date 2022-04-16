import structureTemplate from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';
import { feedInLinks } from './feedInLinks';

import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function feedInChampionship(params = {}) {
  const {
    finishingPositionOffset,
    stageSequence = 1,
    feedsFromFinal,
    staggeredEntry,
    structureName,
    matchUpType,
    feedPolicy,
    feedRounds,
    idPrefix,
    drawSize,
    isMock,
    uuids,
    fmlc,
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
    stage: MAIN,
    matchUpType,
    matchUps,
  });

  const baseDrawSize = drawSize / 2;
  const { matchUps: consolationMatchUps, roundsCount } = feedInMatchUps({
    finishingPositionOffset: baseDrawSize,
    idPrefix: idPrefix && `${idPrefix}-c`,
    isConsolation: true,
    feedsFromFinal,
    baseDrawSize,
    matchUpType,
    feedRounds,
    isMock,
    uuids,
    fmlc,
  });

  const consolationStructure = structureTemplate({
    matchUps: consolationMatchUps,
    structureId: uuids?.pop(),
    structureName: CONSOLATION,
    stage: CONSOLATION,
    stageSequence: 1,
    matchUpType,
  });

  const links = feedInLinks({
    consolationStructure,
    mainStructure,
    roundsCount,
    feedPolicy,
    fmlc,
  });

  return {
    structures: [mainStructure, consolationStructure],
    ...SUCCESS,
    links,
  };
}
