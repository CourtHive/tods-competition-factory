import { replaceTieMatchUpParticipantId } from '../../../tournamentEngine/governors/eventGovernor/replaceTieMatchUpParticipant';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getParticipantId } from '../../../global/functions/extractors';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

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

  const { matchUp } = findMatchUp({
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

  const inContextDualMatchUp = inContextDrawMatchUps.find(
    (drawMatchUp) => drawMatchUp.matchUpId === inContextMatchUp.matchUpTieId
  );

  // ensure that existingParticipantId and substituteParticipantId are on the same team
  const relevantSide = inContextDualMatchUp.sides.find((side) =>
    side.participant.individualParticipants.some(
      ({ participantId }) => participantId === existingParticipantId
    )
  );

  if (!relevantSide || (sideNumber && relevantSide.sideNumber !== sideNumber))
    return { error: INVALID_PARTICIPANT_ID };

  // if no sideNumber is provided, segregate available by sideNumber and specify sideNumber
  const availableParticipantIds =
    relevantSide.participant.individualParticipants
      .map(getParticipantId)
      .filter((participantId) => participantId !== existingParticipantId);

  if (!availableParticipantIds.includes(substituteParticipantId))
    return { error: INVALID_PARTICIPANT_ID };

  return replaceTieMatchUpParticipantId({
    newParticipantId: substituteParticipantId,
    tieMatchUpId: matchUpId,
    existingParticipantId,
    substitution: true,
    tournamentRecord,
    drawDefinition,
    event,
  });
}
