import { getStageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import structureTemplate from '../../drawEngine/generators/structureTemplate';
import { feedInLinks } from '../../drawEngine/generators/feedInLinks';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';

import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function feedInChampionship(props = {}) {
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
    fmlc,
  } = props;

  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
  const { matchUps } = staggeredEntry
    ? feedInMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids })
    : treeMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids });

  const mainStructure = structureTemplate({
    structureName: structureName || MAIN,
    structureId: uuids?.pop(),
    stageSequence,
    stage: MAIN,
    matchUps,
  });

  drawDefinition.structures.push(mainStructure);

  const baseDrawSize = drawSize / 2;
  const { matchUps: consolationMatchUps, roundsCount } = feedInMatchUps({
    feedRounds,
    matchUpType,
    baseDrawSize,
    feedsFromFinal,
    isConsolation: true,
    finishingPositionOffset: baseDrawSize,
    uuids,
    fmlc,
  });

  const consolationStructure = structureTemplate({
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
