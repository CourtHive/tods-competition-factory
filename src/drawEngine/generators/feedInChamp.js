import structureTemplate from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';
import { feedInLinks } from './feedInLinks';

import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_FEED_IN } from '../../constants/policyConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function feedInChampionship(params = {}) {
  const {
    finishingPositionOffset,
    policyDefinitions,
    stageSequence = 1,
    feedsFromFinal,
    staggeredEntry,
    structureName,
    structureId,
    matchUpType,
    feedRounds,
    idPrefix,
    drawSize,
    isMock,
    uuids,
    fmlc,
  } = params;

  const feedPolicy =
    params.feedPolicy || policyDefinitions?.[POLICY_TYPE_FEED_IN];

  // unless policy specifies feedMainFinal, don't feed main final for drawSize <= 4
  const skipRounds =
    drawSize > 4 || feedPolicy?.feedMainFinal ? params.skipRounds : 1;

  const mainParams = {
    finishingPositionOffset,
    matchUpType,
    skipRounds,
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
    stage: MAIN,
    matchUpType,
    matchUps,
  });

  const structures = [mainStructure];
  const links = [];

  const baseDrawSize = drawSize / 2;
  const { matchUps: consolationMatchUps, roundsCount } = feedInMatchUps({
    finishingPositionOffset: baseDrawSize,
    idPrefix: idPrefix && `${idPrefix}-c`,
    isConsolation: true,
    feedsFromFinal,
    baseDrawSize,
    matchUpType,
    feedRounds,
    skipRounds,
    isMock,
    uuids,
    fmlc,
  });

  if (drawSize > 2) {
    const consolationStructure = structureTemplate({
      matchUps: consolationMatchUps,
      structureId: uuids?.pop(),
      structureName: CONSOLATION,
      stage: CONSOLATION,
      stageSequence: 1,
      matchUpType,
    });
    structures.push(consolationStructure);

    const feedLinks = feedInLinks({
      consolationStructure,
      mainStructure,
      roundsCount,
      feedPolicy,
      fmlc,
    });

    links.push(...feedLinks);
  }

  return {
    ...SUCCESS,
    structures,
    links,
  };
}
