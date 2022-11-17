import { structureTemplate } from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';
import { feedInLinks } from './feedInLinks';

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
  matchUpType,
  structureId,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  const mainParams = {
    finishingPositionOffset,
    matchUpType,
    drawSize,
    idPrefix,
    isMock,
    uuids,
  };
  const { matchUps, roundsCount: mainDrawRoundsCount } = staggeredEntry
    ? feedInMatchUps(mainParams)
    : treeMatchUps(mainParams);

  const mainStructure = structureTemplate({
    structureId: structureId || uuids?.pop(),
    matchUps,
    matchUpType,
    stage: MAIN,
    structureName,
    stageSequence,
  });

  const structures = [mainStructure];
  const links = [];

  if (drawSize > 2) {
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
        isMock,
        index,
        uuids,
      });

      structures.push(consolationStructure);

      const links = feedInLinks({
        mainStructure,
        consolationStructure,
        roundsCount: 2,
        roundOffset,
      });

      return { consolationStructure, links };
    });

    const consolationLinks = consolationItems.map((item) => item.links).flat();
    links.push(...consolationLinks);

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
        isMock,
      });
      const playoffStructure = structureTemplate({
        structureId: uuids?.pop(),
        matchUps: playoffMatchUps,
        structureName: PLAY_OFF,
        stageSequence: 2,
        stage: PLAY_OFF,
        matchUpType,
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

      structures.push(playoffStructure);
      links.push(playoffLink);
    }
  }

  return { structures, links, ...SUCCESS };
}

function consolationFeedStructure({
  stageSequence = 1,
  roundOffset = 0,
  matchUpType,
  structureId,
  idPrefix,
  drawSize,
  isMock,
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
      isMock,
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
