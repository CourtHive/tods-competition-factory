import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpIds } from '../../../global/functions/extractors';
import { findStructure } from '../../getters/findStructure';
import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';

export function removeStructure({
  tournamentRecord,
  drawDefinition,
  structureId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const removedMatchUpIds = [];
  const idsToRemove = [structureId];
  const getTargetedStructureIds = (structureId) =>
    drawDefinition.links
      ?.map(
        (link) =>
          link.source.structureId === structureId && link.target.structureId
      )
      .filter(Boolean);

  const structureIds =
    drawDefinition.structures?.map(({ structureId }) => structureId) || [];

  const targetedStructureIdsMap = Object.assign(
    {},
    ...structureIds.map((structureId) => ({
      [structureId]: getTargetedStructureIds(structureId),
    }))
  );

  while (idsToRemove.length) {
    const idBeingRemoved = idsToRemove.pop();
    const { structure } = findStructure({
      drawDefinition,
      structureId: idBeingRemoved,
    });
    const { matchUps } = getAllStructureMatchUps({ structure });
    const matchUpIds = getMatchUpIds(matchUps);
    removedMatchUpIds.push(...matchUpIds);
    drawDefinition.links =
      drawDefinition.links?.filter(
        (link) =>
          link.source.structureId !== idBeingRemoved &&
          link.target.structureId !== idBeingRemoved
      ) || [];
    drawDefinition.structures = (drawDefinition.structures || []).filter(
      (structure) => structure.structureId !== idBeingRemoved
    );
    const targetedStructureIds = targetedStructureIdsMap[idBeingRemoved];
    if (targetedStructureIds?.length) idsToRemove.push(...targetedStructureIds);
  }

  // now get all remaining matchUps in the draw
  const { matchUps } = getAllDrawMatchUps({ drawDefinition });
  matchUps.forEach((matchUp) => {
    if (removedMatchUpIds.includes(matchUp.winnerMatchUpId)) {
      delete matchUp.winnerMatchUpId;
    }
    if (removedMatchUpIds.includes(matchUp.loserMatchUpId)) {
      delete matchUp.loserMatchUpId;
    }
  });

  deleteMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUpIds: removedMatchUpIds,
    action: 'removeStructure',
    eventId: event?.eventId,
    drawDefinition,
  });
  modifyDrawNotice({ drawDefinition, eventId: event?.eventId });

  return { ...SUCCESS, removedMatchUpIds };
}
