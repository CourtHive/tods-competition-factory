import { constantToString } from '../../utilities/strings';
import structureTemplate from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';

import { MAIN, CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  DrawLink,
  LinkTypeEnum,
  PositioningProfileEnum,
  Structure,
} from '../../types/tournamentFromSchema';

export function firstRoundLoserConsolation(params) {
  const {
    finishingPositionOffset = 0,
    playoffAttributes,
    stageSequence = 1,
    staggeredEntry,
    structureName,
    stage = MAIN,
    matchUpType,
    structureId,
    idPrefix,
    drawSize,
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
  const { matchUps } = staggeredEntry
    ? feedInMatchUps(mainParams)
    : treeMatchUps(mainParams);

  const mainStructure = structureTemplate({
    structureName: structureName || constantToString(MAIN),
    structureId: structureId || uuids?.pop(),
    stageSequence,
    matchUpType,
    matchUps,
    stage,
  });

  const structures: Structure[] = [mainStructure];
  const links: DrawLink[] = [];

  if (drawSize > 2) {
    const consolationDrawPositions = drawSize / 2;

    const { matchUps: consolationMatchUps } = treeMatchUps({
      finishingPositionOffset:
        finishingPositionOffset + consolationDrawPositions,
      idPrefix: idPrefix && `${idPrefix}-c`,
      drawSize: consolationDrawPositions,
      matchUpType,
      isMock,
    });

    const consolation = constantToString(CONSOLATION);
    const consolationStructureName =
      playoffAttributes?.['0-1'] ??
      params.consolationStructureName ??
      (structureName ? `${structureName} ${consolation}` : consolation);

    const consolationStructure = structureTemplate({
      structureName: consolationStructureName,
      matchUps: consolationMatchUps,
      structureId: uuids?.pop(),
      stage: CONSOLATION,
      stageSequence: 1,
      matchUpType,
    });
    structures.push(consolationStructure);

    const link: DrawLink = {
      linkType: LinkTypeEnum.Loser,
      source: {
        roundNumber: 1,
        structureId: mainStructure.structureId,
      },
      target: {
        roundNumber: 1,
        feedProfile: PositioningProfileEnum.TopDown,
        structureId: consolationStructure.structureId,
      },
    };

    links.push(link);
  }

  return {
    ...SUCCESS,
    structures,
    links,
  };
}
