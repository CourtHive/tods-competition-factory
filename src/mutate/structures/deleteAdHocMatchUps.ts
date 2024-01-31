import { updateAssignmentParticipantResults } from '@Mutate/drawDefinitions/matchUpGovernor/updateAssignmentParticipantResults';
import { deleteMatchUpsNotice, modifyDrawNotice, modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { getMissingSequenceNumbers, unique } from '@Tools/arrays';
import { getMatchUpId } from '@Functions/global/extractors';
import { xa } from '@Tools/objects';

// constants and types
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { ROUND_OUTCOME } from '@Constants/drawDefinitionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  INVALID_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  STRUCTURE_NOT_FOUND,
} from '@Constants/errorConditionConstants';

type DeleteAdHocMatchUpsArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpIds?: string[];
  structureId?: string;
  event?: Event;
};
export function deleteAdHocMatchUps(params: DeleteAdHocMatchUpsArgs) {
  const { tournamentRecord, matchUpIds = [], drawDefinition, event } = params;
  if (typeof drawDefinition !== 'object') return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(matchUpIds)) return { error: INVALID_VALUES };

  const structureId =
    params.structureId ??
    drawDefinition?.structures?.find((structure) =>
      structure.matchUps?.some(({ matchUpId }) => matchUpIds.includes(matchUpId)),
    )?.structureId;

  if (!structureId) return { error: STRUCTURE_NOT_FOUND };

  const structure: any = drawDefinition.structures?.find((structure) => structure.structureId === structureId);
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const existingMatchUps = structure?.matchUps;
  const structureHasRoundPositions = existingMatchUps?.find((matchUp) => !!matchUp.roundPosition);

  if (structure.structures || structureHasRoundPositions || structure.finishingPosition === ROUND_OUTCOME) {
    return { error: INVALID_STRUCTURE };
  }

  const matchUpIdsWithScoreValue: string[] = [];
  const matchUpsToDelete =
    existingMatchUps?.filter(({ matchUpId, score }) => {
      if (checkScoreHasValue({ score })) matchUpIdsWithScoreValue.push(matchUpId);
      return matchUpIds.includes(matchUpId);
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
