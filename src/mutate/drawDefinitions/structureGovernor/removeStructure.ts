import { deleteMatchUpsNotice, modifyDrawNotice } from '@Mutate/notifications/drawNotifications';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { getAllDrawMatchUps } from '@Query/matchUps/drawMatchUps';
import { getMatchUpIds } from '@Functions/global/extractors';
import { resequenceStructures } from './resequenceStructures';
import { findStructure } from '@Acquire/findStructure';
import { xa } from '@Tools/objects';

// constants and types
import { CANNOT_REMOVE_MAIN_STRUCTURE, SCORES_PRESENT, STRUCTURE_NOT_FOUND } from '@Constants/errorConditionConstants';
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { MAIN, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { POLICY_TYPE_SCORING } from '@Constants/policyConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';

type RemoveStructureArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  structureId: string;
  force?: boolean;
  event: Event;
};

export function removeStructure(params: RemoveStructureArgs) {
  const { tournamentRecord, drawDefinition, structureId, event, force } = params;
  const checkParams = checkRequiredParameters(params, [{ drawDefinition: true, structureId: true }]);
  if (checkParams.error) return checkParams;

  const structures = drawDefinition.structures ?? [];

  const structure = structures.find((structure) => structure.structureId === structureId);
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  // TODO: if structure being rmoved is qualifying structure, ensure no source structures have scored matchUps
  const structureMatchUps = getAllStructureMatchUps({ structure }).matchUps;
  const scoresPresent = structureMatchUps.some(({ score }) => checkScoreHasValue({ score }));

  if (scoresPresent) {
    const appliedPolicies = getAppliedPolicies({
      tournamentRecord,
      drawDefinition,
      structure,
      event,
    })?.appliedPolicies;

    const allowDeletionWithScoresPresent =
      force ?? appliedPolicies?.[POLICY_TYPE_SCORING]?.allowDeletionWithScoresPresent?.structures;

    if (!allowDeletionWithScoresPresent) return { error: SCORES_PRESENT };
  }

  const mainStageSequence1 = structures.find(({ stage, stageSequence }) => stage === MAIN && stageSequence === 1);
  const isMainStageSequence1 = structureId === mainStageSequence1?.structureId;
  const qualifyingStructureIds = structures.filter(({ stage }) => stage === QUALIFYING).map(xa('structureId'));
  if (isMainStageSequence1 && !qualifyingStructureIds.length) return { error: CANNOT_REMOVE_MAIN_STRUCTURE };
  const isQualifyingStructure = qualifyingStructureIds.includes(structureId);

  const { structureIdsToRemove, relatedStructureIdsMap } = getIdsToRemove({
    qualifyingStructureIds,
    isQualifyingStructure,
    isMainStageSequence1,
    mainStageSequence1,
    drawDefinition,
    structureId,
  });

  const { removedMatchUpIds, removedStructureIds } = removeMatchUpsAndStructures({
    relatedStructureIdsMap,
    qualifyingStructureIds,
    isMainStageSequence1,
    mainStageSequence1,
    drawDefinition,
    structureIdsToRemove,
    structureId,
  });

  removeReferencesToRemovedMatchUps({ removedMatchUpIds, drawDefinition });

  // if this is MAIN stageSequence: 1 there must be qualifying, return to empty state
  if (isMainStageSequence1) {
    const mainStageSequence1MatchUpIds = (mainStageSequence1.matchUps ?? [])?.map(xa('matchUpId'));
    removedMatchUpIds.push(...mainStageSequence1MatchUpIds);

    mainStageSequence1.positionAssignments = [];
    mainStageSequence1.seedAssignments = [];
    mainStageSequence1.matchUps = [];
    if (mainStageSequence1.extensions) {
      mainStageSequence1.extensions = [];
    }
  }

  isQualifyingStructure && resequenceStructures({ drawDefinition });

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

function removeReferencesToRemovedMatchUps({ removedMatchUpIds, drawDefinition }) {
  // now cleanup references to removed matchUps
  const { matchUps } = getAllDrawMatchUps({ drawDefinition });
  matchUps?.forEach((matchUp) => {
    if (matchUp.winnerMatchUpId && removedMatchUpIds.includes(matchUp.winnerMatchUpId)) {
      delete matchUp.winnerMatchUpId;
    }
    if (matchUp.loserMatchUpId && removedMatchUpIds.includes(matchUp.loserMatchUpId)) {
      delete matchUp.loserMatchUpId;
    }
  });
}

function getIdsToRemove({
  qualifyingStructureIds,
  isQualifyingStructure,
  isMainStageSequence1,
  mainStageSequence1,
  drawDefinition,
  structureId,
}) {
  const structures = drawDefinition.structures ?? [];
  const structureIds: string[] = structures.map(xa('structureId'));

  const getTargetedStructureIds = (structureId) =>
    drawDefinition.links
      ?.map(
        (link) =>
          link.source.structureId === structureId &&
          link.target.structureId !== mainStageSequence1?.structureId &&
          link.target.structureId,
      )
      .filter(Boolean) ?? [];

  const getQualifyingSourceStructureIds = (structureId) =>
    drawDefinition.links
      ?.map(
        (link) =>
          qualifyingStructureIds.includes(link.source.structureId) &&
          link.target.structureId === structureId &&
          link.source.structureId,
      )
      .filter(Boolean) ?? [];

  const relatedStructureIdsMap = new Map<string, string[]>();
  structureIds.forEach((id) =>
    relatedStructureIdsMap.set(
      id,
      isQualifyingStructure
        ? (getQualifyingSourceStructureIds(id) as string[])
        : (getTargetedStructureIds(id) as string[]),
    ),
  );

  const structureIdsToRemove = isMainStageSequence1 ? relatedStructureIdsMap.get(structureId) : [structureId];
  return { structureIdsToRemove, relatedStructureIdsMap };
}

function removeMatchUpsAndStructures({
  relatedStructureIdsMap,
  qualifyingStructureIds,
  isMainStageSequence1,
  mainStageSequence1,
  drawDefinition,
  structureIdsToRemove,
  structureId,
}) {
  const removedStructureIds: string[] = [];
  const removedMatchUpIds: string[] = [];

  while (structureIdsToRemove?.length) {
    const idBeingRemoved = structureIdsToRemove.pop();
    removedMatchUpIds.push(...getRemovedMatchUpIds({ idBeingRemoved, drawDefinition }));

    const result = pruneLinksAndStructures({
      qualifyingStructureIds,
      isMainStageSequence1,
      idBeingRemoved,
      drawDefinition,
      structureId,
    });
    removedStructureIds.push(...result.removedStructureIds);

    const targetedStructureIds = getTargetedStructureIds({
      relatedStructureIdsMap,
      mainStageSequence1,
      idBeingRemoved,
      structureId,
    });

    if (targetedStructureIds?.length) structureIdsToRemove.push(...targetedStructureIds);
  }

  return { removedMatchUpIds, removedStructureIds };
}

function getTargetedStructureIds({ idBeingRemoved, relatedStructureIdsMap, mainStageSequence1, structureId }) {
  return (
    idBeingRemoved &&
    relatedStructureIdsMap.get(idBeingRemoved)?.filter(
      (id: string) =>
        // IMPORTANT: only delete MAIN stageSequence: 1 if specified to protect against DOUBLE_ELIMINATION scenario
        id !== mainStageSequence1?.structureId || structureId === mainStageSequence1.structureId,
    )
  );
}

function pruneLinksAndStructures({
  qualifyingStructureIds,
  isMainStageSequence1,
  idBeingRemoved,
  drawDefinition,
  structureId,
}) {
  const removedStructureIds: string[] = [];

  drawDefinition.links =
    drawDefinition.links?.filter(
      (link) => link.source.structureId !== idBeingRemoved && link.target.structureId !== idBeingRemoved,
    ) ?? [];

  if (
    !isMainStageSequence1 ||
    (isMainStageSequence1 && qualifyingStructureIds.length) ||
    idBeingRemoved !== structureId
  ) {
    drawDefinition.structures = (drawDefinition.structures ?? []).filter((structure) => {
      if (idBeingRemoved && idBeingRemoved === structure.structureId) removedStructureIds.push(idBeingRemoved);
      return structure.structureId !== idBeingRemoved;
    });
  }

  return { removedStructureIds };
}

function getRemovedMatchUpIds({ idBeingRemoved, drawDefinition }) {
  const { structure } = findStructure({
    structureId: idBeingRemoved,
    drawDefinition,
  });
  const matchUps: HydratedMatchUp[] = getAllStructureMatchUps({ structure }).matchUps;
  return getMatchUpIds(matchUps);
}
