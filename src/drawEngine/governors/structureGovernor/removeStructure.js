import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter';
import { findStructure } from '../../getters/findStructure';
import { addNotice } from '../../../global/globalState';

import { DELETED_MATCHUP_IDS } from '../../../constants/topicConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function removeStructure({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const removedMatchUpIds = [];
  const idsToRemove = [structureId];
  const getTargetedStructureIds = (structureId) =>
    drawDefinition.links
      ?.map(
        (link) =>
          link.sourceStructure.structureId === structureId &&
          link.targetStructure.structureId
      )
      .filter((f) => f);

  const structureIds =
    drawDefinition.structures?.map(({ structureId }) => structureId) || [];

  const targetedStructureIdsMap = structureIds.map((structureId) => ({
    [structureId]: getTargetedStructureIds(structureId),
  }));

  while (idsToRemove.length) {
    const idBeingRemoved = idsToRemove.pop();
    const structure = findStructure({
      drawDefinition,
      structureId: idBeingRemoved,
    });
    const { matchUps } = getAllStructureMatchUps({ structure });
    const matchUpIds = matchUps.map(({ matchUpId }) => matchUpId);
    removedMatchUpIds.push(...matchUpIds);
    drawDefinition.links =
      drawDefinition.links?.filter(
        (link) =>
          link.sourceStructure.structureId !== idBeingRemoved &&
          link.targetStructure.structureId !== idBeingRemoved
      ) || [];
    drawDefinition.structures =
      drawDefinition.stuctures?.filter(
        ({ structureId }) => structureId != idBeingRemoved
      ) || [];
    const targetedStructureIds = targetedStructureIdsMap[idBeingRemoved];
    if (targetedStructureIds?.length) idsToRemove.push(...targetedStructureIds);
  }

  // now get all remaining matchUps in the draw
  const { matchUps } = allDrawMatchUps({ drawDefinition });
  matchUps.forEach((matchUp) => {
    if (removedMatchUpIds.includes(matchUp.winnerMatchUpId)) {
      delete matchUp.winnerMatchUpId;
    }
    if (removedMatchUpIds.includes(matchUp.loserMatchUpId)) {
      delete matchUp.loserMatchUpId;
    }
  });

  addNotice({
    topic: DELETED_MATCHUP_IDS,
    payload: {
      action: 'removeStructure',
      payload: { matchUpIds: removedMatchUpIds },
    },
  });

  return { ...SUCCESS };
}
