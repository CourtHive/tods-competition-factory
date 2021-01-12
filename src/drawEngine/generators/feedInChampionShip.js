import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { feedInLinks } from '../../drawEngine/generators/feedInLinks';
import { stageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import structureTemplate from '../../drawEngine/generators/structureTemplate';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';

export function feedInChampionship(props = {}) {
  const {
    uuids,
    feedRounds,
    stage = MAIN,
    structureName,
    drawDefinition,
    feedsFromFinal,
    stageSequence = 1,
    feedPolicy,
    finishingPositionOffset,
  } = props;

  const drawSize = stageDrawPositionsCount({ stage, drawDefinition });
  const { matchUps } = treeMatchUps({ drawSize, finishingPositionOffset });
  const mainStructure = structureTemplate({
    matchUps,
    stage: MAIN,
    stageSequence,
    structureId: uuids?.pop(),
    structureName: structureName || MAIN,
  });

  drawDefinition.structures.push(mainStructure);

  const baseDrawSize = drawSize / 2;
  const { matchUps: consolationMatchUps, roundsCount } = feedInMatchUps({
    feedRounds,
    baseDrawSize,
    feedsFromFinal,
    isConsolation: true,
    finishingPositionOffset: baseDrawSize,
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
  });

  drawDefinition.links = drawDefinition.links.concat(...links);

  return Object.assign(
    { mainStructure, consolationStructure, links: drawDefinition.links },
    SUCCESS
  );
}
