import { getStageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import structureTemplate from '../../drawEngine/generators/structureTemplate';
import { feedInLinks } from '../../drawEngine/generators/feedInLinks';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';

import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function feedInChampionship(params = {}) {
  const {
    finishingPositionOffset,
    stageSequence = 1,
    feedsFromFinal,
    staggeredEntry,
    drawDefinition,
    structureName,
    stage = MAIN,
    matchUpType,
    feedPolicy,
    feedRounds,
    idPrefix,
    isMock,
    uuids,
    fmlc,
  } = params;

  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
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

  drawDefinition.structures.push(mainStructure);

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

  drawDefinition.structures.push(consolationStructure);

  const links = feedInLinks({
    consolationStructure,
    mainStructure,
    roundsCount,
    feedPolicy,
    fmlc,
  });

  drawDefinition.links = drawDefinition.links.concat(...links);

  return Object.assign(
    {
      structures: [mainStructure, consolationStructure],
      links: drawDefinition.links,
    },
    { ...SUCCESS }
  );
}
