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
    uuids,
    feedRounds,
    matchUpType,
    stage = MAIN,
    structureName,
    drawDefinition,
    feedsFromFinal,
    stageSequence = 1,
    finishingPositionOffset,
    staggeredEntry,
    feedPolicy,
    idPrefix,
    fmlc,
  } = params;

  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
  const mainParams = {
    finishingPositionOffset,
    matchUpType,
    drawSize,
    idPrefix,
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
    isConsolation: true,
    feedsFromFinal,
    baseDrawSize,
    matchUpType,
    feedRounds,
    idPrefix: idPrefix && `${idPrefix}-c`,
    uuids,
    fmlc,
  });

  const consolationStructure = structureTemplate({
    matchUpType,
    stageSequence: 1,
    stage: CONSOLATION,
    structureId: uuids?.pop(),
    structureName: CONSOLATION,
    matchUps: consolationMatchUps,
  });

  drawDefinition.structures.push(consolationStructure);

  const links = feedInLinks({
    mainStructure,
    consolationStructure,
    roundsCount,
    feedPolicy,
    fmlc,
  });

  drawDefinition.links = drawDefinition.links.concat(...links);

  return Object.assign(
    { mainStructure, consolationStructure, links: drawDefinition.links },
    SUCCESS
  );
}
