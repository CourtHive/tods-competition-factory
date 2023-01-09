import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getParticipantId } from '../../../global/functions/extractors';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP,
  INVALID_PARTICIPANT_ID,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';

export function substituteParticipant({
  substituteParticipantId,
  existingParticipantId,
  tournamentRecord,
  drawDefinition,
  sideNumber,
  matchUpId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!existingParticipantId || !substituteParticipantId)
    return { error: MISSING_PARTICIPANT_ID };

  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  if (!matchUp.collectionId) return { error: INVALID_MATCHUP };

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    tournamentParticipants: tournamentRecord?.participants,
    includeByeMatchUps: true,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });

  const inContextMatchUp = inContextDrawMatchUps.find(
    (drawMatchUp) => drawMatchUp.matchUpId === matchUpId
  );

  const existingParticipants = inContextMatchUp.sides
    .filter((side) => !sideNumber || side.sideNumber === sideNumber)
    .flatMap(
      (side) => side.participant?.individualParticipants || side.participant
    )
    .filter(Boolean);
  const existingParticipantIds = existingParticipants.map(getParticipantId);

  if (!existingParticipantIds.includes(existingParticipantId))
    return { error: INVALID_PARTICIPANT_ID };

  const inContextDualMatchUp = inContextDrawMatchUps.find(
    (drawMatchUp) => drawMatchUp.matchUpId === inContextMatchUp.matchUpTieId
  );
  const availableIndividualParticipants = inContextDualMatchUp.sides.map(
    (side) =>
      side.participant.individualParticipants.filter(
        ({ participantId }) => !existingParticipantIds.includes(participantId)
      )
  );

  // if no sideNumber is provided, segregate available by sideNumber and specify sideNumber
  const availableParticipantIds = sideNumber
    ? availableIndividualParticipants[sideNumber - 1]?.map(getParticipantId)
    : availableIndividualParticipants.map((available, i) => ({
        participants: available?.map(getParticipantId),
        sideNumber: i + 1,
      }));

  if (!availableParticipantIds.includes(substituteParticipantId))
    return { error: INVALID_PARTICIPANT_ID };

  structure;

  // if the matchUp is doubles then need to check whether a valid PAIR participant exists and if not create

  return { ...SUCCESS };
}
