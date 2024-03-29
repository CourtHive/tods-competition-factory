// all child matchUps need to be checked for collectionAssignments which need to be removed when collectionDefinition.collectionIds are removed

import { deleteMatchUpsNotice, modifyDrawNotice, modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { compareTieFormats } from '@Query/hierarchical/tieFormats/compareTieFormats';
import { tieFormatTelemetry } from '@Mutate/tieFormat/tieFormatTelemetry';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { setMatchUpState } from '@Mutate/matchUps/matchUpStatus/setMatchUpState';
import { updateTieMatchUpScore } from '@Mutate/matchUps/score/updateTieMatchUpScore';
import { copyTieFormat } from '@Query/hierarchical/tieFormats/copyTieFormat';
import { calculateWinCriteria } from '@Query/matchUp/calculateWinCriteria';
import { getTieFormat } from '@Query/hierarchical/tieFormats/getTieFormat';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { validateTieFormat } from '@Validators/validateTieFormat';
import { allEventMatchUps } from '@Query/matchUps/getAllEventMatchUps';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { allDrawMatchUps } from '@Query/matchUps/getAllDrawMatchUps';
import { definedAttributes } from '@Tools/definedAttributes';
import { findDrawMatchUp } from '@Acquire/findDrawMatchUp';

// constants and types
import { DrawDefinition, Event, MatchUp, TieFormat, Tournament } from '@Types/tournamentTypes';
import { COMPLETED, IN_PROGRESS } from '@Constants/matchUpStatusConstants';
import { decorateResult } from '@Functions/global/decorateResult';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import { TEAM } from '@Constants/matchUpTypes';
import {
  ErrorType,
  MISSING_DRAW_DEFINITION,
  NOT_FOUND,
  NO_MODIFICATIONS_APPLIED,
} from '@Constants/errorConditionConstants';

/*
 * if an eventId is provided, will be removed from an event tieFormat
 * if a drawId is provided, will be removed from a draw tieFormat
 * if a matchUpId is provided, will be removed from matchUp.tieFormat
 * if a structureId is provided, will be removed from structure.tieFormat
 */
type RemoveCollectionDefinitionArgs = {
  updateInProgressMatchUps?: boolean;
  tieFormatComparison?: boolean;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  tieFormatName?: string;
  collectionId: string;
  structureId?: string;
  matchUpId?: string;
  matchUp?: MatchUp;
  eventId?: string;
  event?: Event;
};

export function removeCollectionDefinition({
  updateInProgressMatchUps = true,
  tieFormatComparison,
  tournamentRecord,
  drawDefinition,
  tieFormatName,
  collectionId,
  structureId,
  matchUpId,
  eventId,
  matchUp,
  event,
}: RemoveCollectionDefinitionArgs): {
  targetMatchUps?: HydratedMatchUp[];
  deletedMatchUpIds?: string[];
  tieFormat?: TieFormat;
  success?: boolean;
  error?: ErrorType;
} {
  const stack = 'removeCollectionDefinition';
  let result = !matchUp
    ? getTieFormat({
        drawDefinition,
        structureId,
        matchUpId,
        eventId,
        event,
      })
    : undefined;

  if (result?.error) return decorateResult({ result, stack });

  const structure = result?.structure;
  matchUp = matchUp ?? result?.matchUp;
  const existingTieFormat = result?.tieFormat;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return decorateResult({ result, stack });

  const targetCollection = tieFormat?.collectionDefinitions?.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId,
  );
  if (!targetCollection) return decorateResult({ result: { error: NOT_FOUND, collectionId } });

  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.filter(
    (collectionDefinition) => collectionDefinition.collectionId !== collectionId,
  );

  // if the collectionDefinition being removed contains a collectionGroupNumber,
  // remove the collectionGroup and all references to it in other collectionDefinitions
  if (targetCollection.collectionGroupNumber) {
    tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map((collectionDefinition) => {
      const { collectionGroupNumber, ...rest } = collectionDefinition;
      if (collectionGroupNumber) {
        // collectionGroupNumber removed
      }
      return rest;
    });
    tieFormat.collectionGroups = tieFormat.collectionGroups.filter(
      ({ groupNumber }) => groupNumber !== targetCollection.collectionGroupNumber,
    );
  }

  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria(tieFormat);
  tieFormat.winCriteria = definedAttributes({ aggregateValue, valueGoal });

  // if valueGoal has changed, force renaming of the tieFormat
  const originalValueGoal = existingTieFormat?.winCriteria.valueGoal;
  const wasAggregateValue = existingTieFormat?.winCriteria.aggregateValue;
  if ((originalValueGoal && originalValueGoal !== valueGoal) || (aggregateValue && !wasAggregateValue)) {
    if (tieFormatName) {
      tieFormat.tieFormatName = tieFormatName;
    } else {
      delete tieFormat.tieFormatName;
    }
  }

  // check all scoped lineUps in the drawDefinition to identify collectionAssignments
  let matchUps: MatchUp[] = [];

  if (matchUpId && matchUp) {
    matchUps = [matchUp];
  } else if (structureId && structure) {
    matchUps =
      getAllStructureMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM] },
        structure,
      })?.matchUps ?? [];
  } else if (drawDefinition) {
    matchUps =
      allDrawMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM] },
        drawDefinition,
      })?.matchUps ?? [];
  } else if (event) {
    matchUps =
      allEventMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM] },
        drawDefinition,
      })?.matchUps ?? [];
  }

  // all team matchUps in scope which are completed or which have a score should not be modified
  // UNLESS all collectionMatchUps have no score
  const targetMatchUps = (matchUps || []).filter((matchUp) => {
    const collectionMatchUps = matchUp.tieMatchUps?.filter((tieMatchUp) => tieMatchUp.collectionId === collectionId);
    const collectionScore = collectionMatchUps?.some(checkScoreHasValue);

    const tieFormatDifference =
      tieFormatComparison && matchUp.tieFormat
        ? compareTieFormats({
            descendant: matchUp.tieFormat,
            ancestor: tieFormat,
          })?.different
        : false;

    return (
      (updateInProgressMatchUps && !collectionScore) ||
      (!matchUp.winningSide &&
        matchUp.matchUpStatus !== COMPLETED &&
        (updateInProgressMatchUps ||
          (matchUp.matchUpStatus !== IN_PROGRESS && !checkScoreHasValue(matchUp) && !tieFormatDifference)))
    );
  });

  if (!targetMatchUps.length) {
    return { error: NO_MODIFICATIONS_APPLIED };
  }

  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });

  if (matchUpId && matchUp && updateInProgressMatchUps) {
    const collectionMatchUps = matchUp.tieMatchUps?.filter((tieMatchUp) => tieMatchUp.collectionId === collectionId);
    for (const collectionMatchUp of collectionMatchUps ?? []) {
      let result: any = setMatchUpState({
        matchUpId: collectionMatchUp.matchUpId,
        tieMatchUpId: matchUp?.matchUpId,
        winningSide: undefined,
        removeScore: true,
        tournamentRecord,
        appliedPolicies,
        drawDefinition,
        event,
      });
      if (result.error) return result;

      result = findDrawMatchUp({
        drawDefinition,
        matchUpId,
      });
      if (result.error) return result;
      matchUp = result?.matchUp;
    }
  }

  const deletedMatchUpIds: string[] = [];
  for (const matchUp of targetMatchUps) {
    // remove any collectionAssignments from LineUps that include collectionId
    for (const side of matchUp?.sides ?? []) {
      side.lineUp = (side.lineUp ?? []).map((assignment) => ({
        participantId: assignment.participantId,
        collectionAssignments: (assignment?.collectionAssignments ?? []).filter(
          (collectionAssignment) => collectionAssignment.collectionId !== collectionId,
        ),
      }));
    }

    // delete any tieMatchUps that contain collectionId
    matchUp.tieMatchUps = (matchUp.tieMatchUps ?? []).filter((matchUp) => {
      const deleteTarget = matchUp.collectionId === collectionId;
      if (deleteTarget) deletedMatchUpIds.push(matchUp.matchUpId);
      return !deleteTarget;
    });

    if (matchUp.tieFormat) matchUp.tieFormat = copyTieFormat(tieFormat);

    if (updateInProgressMatchUps) {
      // recalculate score
      const result = updateTieMatchUpScore({
        matchUpId: matchUp.matchUpId,
        exitWhenNoValues: true,
        tournamentRecord,
        appliedPolicies,
        drawDefinition,
        event,
      });
      if (result.error) return result;
    }

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      drawDefinition,
      context: stack,
      matchUp,
    });
  }

  // remove any matchUps which contain collectionId
  if (deletedMatchUpIds.length) {
    // notify subscribers that matchUps have been deleted
    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds: deletedMatchUpIds,
      eventId: event?.eventId,
      drawDefinition,
    });
  }

  const prunedTieFormat = definedAttributes(tieFormat);
  result = validateTieFormat({ tieFormat: prunedTieFormat });
  if (result.error) return decorateResult({ result, stack });

  // TODO: implement use of tieFormats and tieFormatId
  if (eventId && event) {
    event.tieFormat = prunedTieFormat;
    // NOTE: there is not a modifyEventNotice
  } else if (matchUpId && matchUp) {
    matchUp.tieFormat = prunedTieFormat;
  } else if (structure) {
    structure.tieFormat = prunedTieFormat;
  } else if (drawDefinition) {
    drawDefinition.tieFormat = prunedTieFormat;
  } else if (!matchUp || !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  modifyDrawNotice({ drawDefinition, eventId: event?.eventId });

  const auditData = definedAttributes({
    drawId: drawDefinition?.drawId,
    action: stack,
    collectionId,
    structureId,
    matchUpId,
    eventId,
  });
  tieFormatTelemetry({ appliedPolicies, drawDefinition, auditData });

  return {
    tieFormat: prunedTieFormat,
    deletedMatchUpIds,
    targetMatchUps,
    ...SUCCESS,
  };
}
