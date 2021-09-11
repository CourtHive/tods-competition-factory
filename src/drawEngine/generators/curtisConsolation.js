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
  finishingPositionOffset,
  structureName = MAIN,
  stageSequence = 1,
  staggeredEntry,
  drawDefinition,
  matchUpType,
  idPrefix,
  uuids,
}) {
  const drawSize = getStageDrawPositionsCount({ stage: MAIN, drawDefinition });

  const mainParams = {
    finishingPositionOffset,
    matchUpType,
    drawSize,
    idPrefix,
    uuids,
  };
  const { matchUps, roundsCount: mainDrawRoundsCount } = staggeredEntry
    ? feedInMatchUps(mainParams)
    : treeMatchUps(mainParams);

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
      structureId: uuids?.pop(),
      idPrefix: idPrefix && `${idPrefix}-c${index}`,
      stageSequence,
      roundOffset,
      matchUpType,
      drawSize,
      index,
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
      finishingPositionOffset: 2,
      idPrefix: idPrefix && `${idPrefix}-p3t4`,
      drawSize: 2,
      matchUpType,
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
  stageSequence = 1,
  roundOffset = 0,
  matchUpType,
  structureId,
  idPrefix,
  drawSize,
  index,
  uuids,
}) {
  const consolationDrawPositions = drawSize / (2 * Math.pow(2, roundOffset));

  const { matchUps: consolationMatchUps, roundsCount: consolationRoundsCount } =
    feedInMatchUps({
      finishingPositionOffset: consolationDrawPositions,
      baseDrawSize: consolationDrawPositions,
      isConsolation: true,
      feedRounds: 1,
      matchUpType,
      idPrefix,
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
