import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpIds } from '../../../global/functions/extractors';
import { extractAttributes as xa } from '../../../utilities';
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

  const structures = drawDefinition.structures || [];
  const removedStructureIds: string[] = [];

  const mainStageSequence1 = structures.find(
    ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
  );
  const isMainStageSequence1 = structureId === mainStageSequence1.structureId;
  const qualifyingStructureIds = structures
    .filter(({ stage }) => stage === QUALIFYING)
    .map(xa('structureId'));

  if (isMainStageSequence1 && !qualifyingStructureIds.length) {
    return { error: CANNOT_REMOVE_MAIN_STRUCTURE };
  }

  const structureIds = structures.map(xa('structureId'));
  const removedMatchUpIds: string[] = [];
  const idsToRemove = [structureId];

  const getTargetedStructureIds = (structureId) =>
    drawDefinition.links
      ?.map(
        (link) =>
          link.source.structureId === structureId &&
          link.target.structureId !== mainStageSequence1.structureId &&
          link.target.structureId
      )
      .filter(Boolean);

  const getQualifyingSourceStructureIds = (structureId) =>
    drawDefinition.links
      ?.map(
        (link) =>
          qualifyingStructureIds.includes(link.source.structureId) &&
          link.target.structureId === structureId &&
          link.source.structureId
      )
      .filter(Boolean);

  const isQualifyingStructure = qualifyingStructureIds.includes(structureId);
  const relatedStructureIdsMap = new Map<string, string[]>();
  structureIds.forEach((id) =>
    relatedStructureIdsMap.set(
      id,
      isQualifyingStructure
        ? getQualifyingSourceStructureIds(id)
        : getTargetedStructureIds(id)
    )
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

    drawDefinition.links =
      drawDefinition.links?.filter(
        (link) =>
          link.source.structureId !== idBeingRemoved &&
          link.target.structureId !== idBeingRemoved
      ) || [];

    if (!isMainStageSequence1 || idBeingRemoved !== structureId) {
      drawDefinition.structures = (drawDefinition.structures ?? []).filter(
        (structure) => {
          if (idBeingRemoved && idBeingRemoved === structure.structureId)
            removedStructureIds.push(idBeingRemoved);
          return structure.structureId !== idBeingRemoved;
        }
      );
    }

    const targetedStructureIds =
      idBeingRemoved &&
      // targetedStructureIdsMap[idBeingRemoved].filter(
      relatedStructureIdsMap.get(idBeingRemoved)?.filter(
        (id: string) =>
          // IMPORTANT: only delete MAIN stageSequence: 1 if specified to protect against DOUBLE_ELIMINATION scenario
          id !== mainStageSequence1.structureId ||
          structureId === mainStageSequence1.structureId
      );
    if (targetedStructureIds?.length) idsToRemove.push(...targetedStructureIds);
  }

  // now get all remaining matchUps in the draw
  const { matchUps } = getAllDrawMatchUps({ drawDefinition });
  matchUps?.forEach((matchUp) => {
    if (
      matchUp.winnerMatchUpId &&
      removedMatchUpIds.includes(matchUp.winnerMatchUpId)
    ) {
      delete matchUp.winnerMatchUpId;
    }
    if (
      matchUp.loserMatchUpId &&
      removedMatchUpIds.includes(matchUp.loserMatchUpId)
    ) {
      delete matchUp.loserMatchUpId;
    }
  });

  // if this is MAIN stageSequence: 1 there must be qualifying, return to empty state
  if (isMainStageSequence1) {
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

  return { ...SUCCESS, removedMatchUpIds, removedStructureIds };
}
