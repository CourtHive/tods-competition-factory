import { feedInLinks } from '../../drawEngine/generators/feedInLinks';
import { stageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';
import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import {
  MAIN,
  CONSOLATION,
  PLAY_OFF,
  TOP_DOWN,
  LOSER,
} from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function generateCurtisConsolation({
  uuids,
  drawDefinition,
  stageSequence = 1,
  structureName = MAIN,
  finishingPositionOffset,
}) {
  const drawSize = stageDrawPositionsCount({ stage: MAIN, drawDefinition });

  const { matchUps, roundsCount: mainDrawRoundsCount } = treeMatchUps({
    drawSize,
    finishingPositionOffset,
  });
  const mainStructure = structureTemplate({
    matchUps,
    stage: MAIN,
    structureName,
    stageSequence,
    structureId: uuids?.pop(),
  });

  drawDefinition.structures.push(mainStructure);

  const feedRoundOffsets = [0, 2].slice(0, drawSize / 16);
  const consolationItems = feedRoundOffsets.map((roundOffset, index) => {
    const stageSequence = index + 1;
    const { consolationStructure } = consolationFeedStructure({
      drawSize,
      index,
      roundOffset,
      stageSequence,
      structureId: uuids?.pop(),
    });

    drawDefinition.structures.push(consolationStructure);

    const links = feedInLinks({
      mainStructure,
      consolationStructure,
      roundsCount: 2,
      roundOffset,
    });

    return { consolationStructure, links };
  });

  const links = consolationItems.map(item => item.links);
  drawDefinition.links = drawDefinition.links.concat(...links);

  // only add 3-4 playoff structure
  // 1. if there is one consolation round, drawSize === 16
  // 2. if drawSize > 32
  // when drawSize === 32 then all rounds feed into the two consolation structures
  if ((drawSize >= 4 && drawSize <= 16) || drawSize > 32) {
    const { matchUps: playoffMatchUps } = treeMatchUps({
      drawSize: 2,
      finishingPositionOffset: 2,
    });
    const playoffStructure = structureTemplate({
      structureId: uuids?.pop(),
      matchUps: playoffMatchUps,
      structureName: PLAY_OFF,
      stageSequence: 2,
      stage: MAIN,
    });

    const playoffLink = {
      linkType: LOSER,
      source: {
        roundNumber: mainDrawRoundsCount - 1,
        structureId: mainStructure.structureId,
      },
      target: {
        roundNumber: 1,
        feedProfile: TOP_DOWN,
        structureId: playoffStructure.structureId,
      },
    };

    drawDefinition.structures.push(playoffStructure);
    drawDefinition.links.push(playoffLink);
  }

  return Object.assign(
    {
      structures: drawDefinition.structures,
      links: drawDefinition.links,
    },
    SUCCESS
  );
}

function consolationFeedStructure({
  drawSize,
  index,
  structureId,
  roundOffset = 0,
  stageSequence = 1,
}) {
  const consolationDrawPositions = drawSize / (2 * Math.pow(2, roundOffset));

  const {
    matchUps: consolationMatchUps,
    roundsCount: consolationRoundsCount,
  } = feedInMatchUps({
    feedRounds: 1,
    baseDrawSize: consolationDrawPositions,
    isConsolation: true,
    finishingPositionOffset: consolationDrawPositions,
  });

  const structureName = `${CONSOLATION} ${index + 1}`;
  const consolationStructure = structureTemplate({
    matchUps: consolationMatchUps,
    stage: CONSOLATION,
    structureName,
    stageSequence,
    structureId,
  });

  return { consolationStructure, consolationRoundsCount };
}
