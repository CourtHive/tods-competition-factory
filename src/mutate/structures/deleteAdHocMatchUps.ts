import { updateAssignmentParticipantResults } from '@Mutate/drawDefinitions/matchUpGovernor/updateAssignmentParticipantResults';
import { deleteMatchUpsNotice, modifyDrawNotice, modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { getMissingSequenceNumbers, unique } from '@Tools/arrays';
import { getMatchUpId } from '@Functions/global/extractors';
import { xa } from '@Tools/objects';

// constants and types
import { ARRAY, DRAW_DEFINITION, INVALID, MATCHUP_IDS, OF_TYPE, ONE_OF } from '@Constants/attributeConstants';
import { INVALID_STRUCTURE, INVALID_VALUES, STRUCTURE_NOT_FOUND } from '@Constants/errorConditionConstants';
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { ROUND_OUTCOME } from '@Constants/drawDefinitionConstants';
import { SUCCESS } from '@Constants/resultConstants';

type DeleteAdHocMatchUpsArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  removeUnAssigned?: boolean; // defaults to true
  removeIncomplete?: boolean; // defaults to false
  removeCompleted?: boolean; // defaults to false
  roundNumbers?: number[];
  matchUpIds?: string[];
  structureId?: string;
  event?: Event;
};
export function deleteAdHocMatchUps(params: DeleteAdHocMatchUpsArgs) {
  const paramsCheck = checkRequiredParameters(params, [
    { [DRAW_DEFINITION]: true },
    {
      [ONE_OF]: { [MATCHUP_IDS]: false, roundNumbers: false },
      [INVALID]: INVALID_VALUES,
      [OF_TYPE]: ARRAY,
    },
  ]);
  if (paramsCheck.error) return paramsCheck;

  let matchUpIds = params.matchUpIds ?? [];
  const {
    removeIncomplete = false,
    removeUnAssigned = true,
    removeCompleted = false,
    tournamentRecord,
    drawDefinition,
    event,
  } = params;

  const structureId =
    params.structureId ??
    drawDefinition?.structures?.find((structure) =>
      structure.matchUps?.some(({ matchUpId }) => matchUpIds.includes(matchUpId)),
    )?.structureId ??
    drawDefinition?.structures?.[0]?.structureId;

  if (!structureId) return { error: STRUCTURE_NOT_FOUND };

  const structure: any = drawDefinition.structures?.find((structure) => structure.structureId === structureId);
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const existingMatchUps = structure?.matchUps;
  const structureHasRoundPositions = existingMatchUps?.find((matchUp) => !!matchUp.roundPosition);

  if (structure.structures || structureHasRoundPositions || structure.finishingPosition === ROUND_OUTCOME) {
    return { error: INVALID_STRUCTURE };
  }

  if (params.roundNumbers) {
    const existingRoundMatchUpIds = existingMatchUps
      .filter(({ roundNumber }) => params.roundNumbers?.includes(roundNumber))
      .map(getMatchUpId);
    if (matchUpIds.length) {
      matchUpIds = matchUpIds.filter((matchUpId) => existingRoundMatchUpIds.includes(matchUpId));
    } else {
      matchUpIds = existingRoundMatchUpIds;
    }
  }

  const matchUpIdsWithScoreValue: string[] = [];
  const matchUpsToDelete =
    existingMatchUps?.filter(({ matchUpId, score, winningSide }) => {
      if (checkScoreHasValue({ score })) {
        if (!winningSide && !removeIncomplete) return false;
        if (winningSide && !removeCompleted) return false;
        matchUpIdsWithScoreValue.push(matchUpId);
      } else if (!removeUnAssigned) return false;
      return matchUpIds?.includes(matchUpId);
    }) ?? [];
  const matchUpIdsToDelete = matchUpsToDelete.map(getMatchUpId);
  const tieMatchUpIdsToDelete: string[] = matchUpsToDelete
    .map(({ tieMatchUps }) => tieMatchUps?.map(getMatchUpId))
    .filter(Boolean)
    .flat();

  if (matchUpIdsToDelete.length) {
    structure.matchUps = (structure.matchUps ?? []).filter(({ matchUpId }) => !matchUpIdsToDelete.includes(matchUpId));

    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds: [...tieMatchUpIdsToDelete, ...matchUpIdsToDelete],
      action: 'deleteAdHocMatchUps',
      eventId: event?.eventId,
      drawDefinition,
    });

    const roundNumbers = unique(structure.matchUps.map(xa('roundNumber')));
    const missingRoundNumbers = getMissingSequenceNumbers(roundNumbers);
    if (missingRoundNumbers.length) {
      missingRoundNumbers.reverse();
      for (const roundNumber of missingRoundNumbers) {
        structure.matchUps.forEach((matchUp) => {
          if (matchUp.roundNumber && matchUp.roundNumber > roundNumber) {
            matchUp.roundNumber -= 1;
            modifyMatchUpNotice({
              tournamentId: tournamentRecord?.tournamentId,
              context: ['adHoc round deletion'],
              eventId: event?.eventId,
              drawDefinition,
              matchUp,
            });
          }
        });
      }
    }

    if (matchUpIdsWithScoreValue.length) {
      structure.positionAssignments = unique(
        structure.matchUps
          .flatMap((matchUp) => (matchUp.sides ?? []).map((side) => side.participantId))
          .filter(Boolean),
      ).map((participantId) => ({ participantId }));

      const matchUpFormat = structure?.matchUpFormat ?? drawDefinition?.matchUpFormat ?? event?.matchUpFormat;

      const { matchUps } = getAllStructureMatchUps({
        afterRecoveryTimes: false,
        inContext: true,
        structure,
        event,
      });

      const result = updateAssignmentParticipantResults({
        positionAssignments: structure.positionAssignments,
        tournamentRecord,
        drawDefinition,
        matchUpFormat,
        matchUps,
        event,
      });
      if (result.error) console.log(result);
    }

    modifyDrawNotice({
      structureIds: [structureId],
      eventId: event?.eventId,
      drawDefinition,
    });
  }

  return { ...SUCCESS };
}
