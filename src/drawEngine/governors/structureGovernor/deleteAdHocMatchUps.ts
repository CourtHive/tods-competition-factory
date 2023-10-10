import { updateAssignmentParticipantResults } from '../matchUpGovernor/updateAssignmentParticipantResults';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getMissingSequenceNumbers } from '../../../utilities/arrays';
import { extractAttributes, unique } from '../../../utilities';
import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';

import { ROUND_OUTCOME } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentFromSchema';

type DeleteAdHocMatchUpsArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpIds?: string[];
  structureId: string;
  event?: Event;
};
export function deleteAdHocMatchUps({
  tournamentRecord,
  matchUpIds = [],
  drawDefinition,
  structureId,
  event,
}: DeleteAdHocMatchUpsArgs) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (!Array.isArray(matchUpIds)) return { error: INVALID_VALUES };

  const structure = drawDefinition.structures?.find(
    (structure) => structure.structureId === structureId
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const existingMatchUps = structure?.matchUps;
  const structureHasRoundPositions = existingMatchUps?.find(
    (matchUp) => !!matchUp.roundPosition
  );

  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  const matchUpIdsWithScoreValue: string[] = [];
  const matchUpsToDelete =
    existingMatchUps?.filter(({ matchUpId, score }) => {
      if (scoreHasValue({ score })) matchUpIdsWithScoreValue.push(matchUpId);
      return matchUpIds.includes(matchUpId);
    }) ?? [];
  const matchUpIdsToDelete = matchUpsToDelete.map(
    extractAttributes('matchUpId')
  );

  if (matchUpIdsToDelete.length) {
    structure.matchUps = (structure.matchUps ?? []).filter(
      ({ matchUpId }) => !matchUpIdsToDelete.includes(matchUpId)
    );

    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds: matchUpIdsToDelete,
      action: 'deleteAdHocMatchUps',
      eventId: event?.eventId,
      drawDefinition,
    });

    const roundNumbers = unique(
      structure.matchUps.map(extractAttributes('roundNumber'))
    );
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
          .flatMap((matchUp) =>
            (matchUp.sides ?? []).map((side) => side.participantId)
          )
          .filter(Boolean)
      ).map((participantId) => ({ participantId }));

      const matchUpFormat =
        structure?.matchUpFormat ??
        drawDefinition?.matchUpFormat ??
        event?.matchUpFormat;

      const result = updateAssignmentParticipantResults({
        positionAssignments: structure.positionAssignments,
        matchUps: structure.matchUps,
        tournamentRecord,
        drawDefinition,
        matchUpFormat,
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
