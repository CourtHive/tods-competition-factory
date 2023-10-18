import { constantToString } from '../../utilities/strings';
import { structureTemplate } from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';
import { feedInLinks } from './feedInLinks';

import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  CONSOLATION,
  PLAY_OFF,
} from '../../constants/drawDefinitionConstants';
import {
  DrawLink,
  LinkTypeEnum,
  PositioningProfileEnum,
  Structure,
} from '../../types/tournamentFromSchema';

export function generateCurtisConsolation(params) {
  const {
    structureName = constantToString(MAIN),
    playoffStructureNameBase,
    finishingPositionOffset,
    stageSequence = 1,
    structureNameMap,
    staggeredEntry,
    stage = MAIN,
    matchUpType,
    structureId,
    drawSize,
    idPrefix,
    isMock,
    uuids,
  } = params;

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
    structureName,
    stageSequence,
    matchUpType,
    matchUps,
    stage,
  });

  const structures: Structure[] = [mainStructure];
  const links: DrawLink[] = [];

  if (drawSize > 2) {
    const feedRoundOffsets = [0, 2].slice(0, drawSize / 16);
    const consolationItems = feedRoundOffsets.map((roundOffset, index) => {
      const stageSequence = index + 1;
      const { consolationStructure } = consolationFeedStructure({
        idPrefix: idPrefix && `${idPrefix}-c${index}`,
        structureId: uuids?.pop(),
        playoffStructureNameBase,
        structureNameMap,
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
        consolationStructure,
        roundsCount: 2,
        mainStructure,
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
        idPrefix: idPrefix && `${idPrefix}-p3t4`,
        finishingPositionOffset: 2,
        drawSize: 2,
        matchUpType,
        isMock,
      });
      const defaultName = constantToString(PLAY_OFF);
      const mappedStructureName =
        structureNameMap?.[defaultName] || defaultName;
      const structureName = playoffStructureNameBase
        ? `${playoffStructureNameBase} ${mappedStructureName}`
        : mappedStructureName;

      const playoffStructure = structureTemplate({
        structureId: uuids?.pop(),
        matchUps: playoffMatchUps,
        stageSequence: 2,
        stage: PLAY_OFF,
        structureName,
        matchUpType,
      });

      const playoffLink: DrawLink = {
        linkType: LinkTypeEnum.Loser,
        source: {
          roundNumber: mainDrawRoundsCount - 1,
          structureId: mainStructure.structureId,
        },
        target: {
          structureId: playoffStructure.structureId,
          feedProfile: PositioningProfileEnum.TopDown,
          roundNumber: 1,
        },
      };

      structures.push(playoffStructure);
      links.push(playoffLink);
    }
  }

  return { structures, links, ...SUCCESS };
}

function consolationFeedStructure({
  playoffStructureNameBase,
  stageSequence = 1,
  structureNameMap,
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
  const defaultName = `${constantToString(CONSOLATION)} ${index + 1}`;
  const mappedStructureName = structureNameMap?.[defaultName] || defaultName;
  const structureName = playoffStructureNameBase
    ? `${playoffStructureNameBase} ${mappedStructureName}`
    : mappedStructureName;

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
