import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import { getStageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import { feedInLinks } from '../../drawEngine/generators/feedInLinks';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';

import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  CONSOLATION,
  PLAY_OFF,
  TOP_DOWN,
  LOSER,
} from '../../constants/drawDefinitionConstants';

export function generateCurtisConsolation({
  uuids,
  matchUpType,
  staggeredEntry,
  drawDefinition,
  stageSequence = 1,
  structureName = MAIN,
  finishingPositionOffset,
}) {
  const drawSize = getStageDrawPositionsCount({ stage: MAIN, drawDefinition });

  const { matchUps, roundsCount: mainDrawRoundsCount } = staggeredEntry
    ? feedInMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids })
    : treeMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids });

  const mainStructure = structureTemplate({
    matchUps,
    matchUpType,
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
      index,
      drawSize,
      matchUpType,
      roundOffset,
      stageSequence,
      structureId: uuids?.pop(),
      uuids,
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

  const links = consolationItems.map((item) => item.links);
  drawDefinition.links = drawDefinition.links.concat(...links);

  // only add 3-4 playoff structure
  // 1. if there is one consolation round, drawSize === 16
  // 2. if drawSize > 32
  // when drawSize === 32 then all rounds feed into the two consolation structures
  if ((drawSize >= 4 && drawSize <= 16) || drawSize > 32) {
    const { matchUps: playoffMatchUps } = treeMatchUps({
      drawSize: 2,
      matchUpType,
      finishingPositionOffset: 2,
    });
    const playoffStructure = structureTemplate({
      structureId: uuids?.pop(),
      matchUps: playoffMatchUps,
      structureName: PLAY_OFF,
      stageSequence: 2,
      matchUpType,
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
  index,
  drawSize,
  matchUpType,
  structureId,
  roundOffset = 0,
  stageSequence = 1,
  uuids,
}) {
  const consolationDrawPositions = drawSize / (2 * Math.pow(2, roundOffset));

  const { matchUps: consolationMatchUps, roundsCount: consolationRoundsCount } =
    feedInMatchUps({
      feedRounds: 1,
      matchUpType,
      baseDrawSize: consolationDrawPositions,
      isConsolation: true,
      finishingPositionOffset: consolationDrawPositions,
      uuids,
    });

  const structureName = `${CONSOLATION} ${index + 1}`;
  const consolationStructure = structureTemplate({
    matchUps: consolationMatchUps,
    stage: CONSOLATION,
    structureName,
    stageSequence,
    matchUpType,
    structureId,
  });

  return { consolationStructure, consolationRoundsCount };
}
