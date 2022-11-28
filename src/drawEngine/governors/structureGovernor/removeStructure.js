import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpIds } from '../../../global/functions/extractors';
import { findStructure } from '../../getters/findStructure';
import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
} from '../../notifications/drawNotifications';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  CANNOT_REMOVE_MAIN_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';

export function removeStructure({
  tournamentRecord,
  drawDefinition,
  structureId,
  event,
}) {
  if (typeof structureId !== 'string') return { error: INVALID_VALUES };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { hasQualifying, mainStageSequence1 } =
    drawDefinition.structures.reduce((result, structure) => {
      const { stage, stageSequence } = structure;
      if (stage === QUALIFYING) result.hasQualifying = true;
      if (
        structure.structureId === structureId &&
        stage === MAIN &&
        stageSequence === 1
      ) {
        result.mainStageSequence1 = structure;
      }
      return result;
    }, {});

  if (mainStageSequence1 && !hasQualifying) {
    return { error: CANNOT_REMOVE_MAIN_STRUCTURE };
  }

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
      structureId: idBeingRemoved,
      drawDefinition,
    });
    const { matchUps } = getAllStructureMatchUps({ structure });
    const matchUpIds = getMatchUpIds(matchUps);
    removedMatchUpIds.push(...matchUpIds);

    if (!mainStageSequence1 || idBeingRemoved !== structureId) {
      drawDefinition.links =
        drawDefinition.links?.filter(
          (link) =>
            link.source.structureId !== idBeingRemoved &&
            link.target.structureId !== idBeingRemoved
        ) || [];

      drawDefinition.structures = (drawDefinition.structures || []).filter(
        (structure) => structure.structureId !== idBeingRemoved
      );
    }

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

  // if this is MAIN stageSequence: 1 there must be qualifying, return to empty state
  if (mainStageSequence1) {
    mainStageSequence1.positionAssignments = [];
    mainStageSequence1.seedAssignments = [];
    mainStageSequence1.matchUps = [];
    if (mainStageSequence1.extensions) {
      mainStageSequence1.extensions = [];
    }
  }

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
