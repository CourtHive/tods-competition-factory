import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { feedInLinks } from '../../drawEngine/generators/feedInLinks';
import { stageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import structureTemplate from '../../drawEngine/generators/structureTemplate';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';

// export function feedInChampionship({drawDefinition, feedsFromFinal, feedRounds}={}) {
export function feedInChampionship(props = {}) {
  const {
    stage = MAIN,
    feedRounds,
    structureName,
    drawDefinition,
    feedsFromFinal,
    stageSequence = 1,
    finishingPositionOffset,
  } = props;

  const drawSize = stageDrawPositionsCount({ stage, drawDefinition });
  const { matchUps } = treeMatchUps({ drawSize, finishingPositionOffset });
  const mainStructure = structureTemplate({
    stage: MAIN,
    matchUps,
    structureName: structureName || MAIN,
    stageSequence,
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
    stage: CONSOLATION,
    matchUps: consolationMatchUps,
    structureName: CONSOLATION,
    stageSequence: 1,
  });

  drawDefinition.structures.push(consolationStructure);

  const links = feedInLinks({
    mainStructure,
    consolationStructure,
    roundsCount,
  });

  drawDefinition.links = drawDefinition.links.concat(...links);

  return Object.assign(
    { mainStructure, consolationStructure, links: drawDefinition.links },
    SUCCESS
  );
}
