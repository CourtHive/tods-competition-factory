import { constantToString } from '../../utilities/strings';
import structureTemplate from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';
import { feedInLinks } from './feedInLinks';

import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_FEED_IN } from '../../constants/policyConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { DrawLink } from '../../types/tournamentTypes';

export function feedInChampionship(params) {
  const {
    finishingPositionOffset,
    stageSequence = 1,
    playoffAttributes,
    policyDefinitions,
    feedsFromFinal,
    staggeredEntry,
    structureName,
    stage = MAIN,
    structureId,
    matchUpType,
    skipRounds,
    feedRounds,
    idPrefix,
    drawSize,
    isMock,
    uuids,
    fmlc,
  } = params;

  const feedPolicy =
    params.feedPolicy || policyDefinitions?.[POLICY_TYPE_FEED_IN];

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
    structureName:
      structureName || playoffAttributes?.['0']?.name || constantToString(MAIN),
    structureId: structureId || uuids?.pop(),
    stageSequence,
    matchUpType,
    matchUps,
    stage,
  });

  const structures = [mainStructure];
  const links: DrawLink[] = [];

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
    const name =
      playoffAttributes?.['0-1']?.name ?? constantToString(CONSOLATION);
    const structureName = params.playoffStructureNameBase
      ? `${params.playoffStructureNameBase} ${name}`
      : name;

    const consolationStructure = structureTemplate({
      matchUps: consolationMatchUps,
      structureId: uuids?.pop(),
      stage: CONSOLATION,
      stageSequence: 1,
      structureName,
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
