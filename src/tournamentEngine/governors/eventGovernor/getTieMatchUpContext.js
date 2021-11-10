import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getMatchUpsMap } from '../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { getParticipantIds } from '../../../global/functions/extractors';

import { TEAM } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_MATCHUP,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getTieMatchUpContext({
  tournamentRecord,
  drawDefinition,
  tieMatchUpId,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!event) return { error: EVENT_NOT_FOUND };

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  // tieMatchUp is matchUpType: SINGLES or DOUBLES
  const { matchUp: tieMatchUp, structure } = findMatchUp({
    tournamentParticipants: tournamentRecord.participants,
    matchUpId: tieMatchUpId,
    inContext: true,
    drawDefinition,
    matchUpsMap,
    event,
  });

  if (!tieMatchUp) return { error: MATCHUP_NOT_FOUND };

  const {
    collectionPosition,
    drawPositions,
    collectionId,
    matchUpTieId,
    matchUpType,
  } = tieMatchUp;

  if (![SINGLES, DOUBLES].includes(matchUpType))
    return { error: INVALID_MATCHUP };

  const { positionAssignments } = getPositionAssignments({ structure });
  const relevantAssignments = positionAssignments?.filter((assignment) =>
    drawPositions?.includes(assignment.drawPosition)
  );

  const participantIds = getParticipantIds(relevantAssignments);
  const { tournamentParticipants: teamParticipants } =
    getTournamentParticipants({
      tournamentRecord,
      participantFilters: {
        participantTypes: [TEAM],
        participantIds,
      },
    });

  const { matchUp: dualMatchUp } = findMatchUp({
    matchUpId: matchUpTieId,
    drawDefinition,
    matchUpsMap,
  });

  const tieFormat =
    dualMatchUp.tieFormat ||
    structure.tieFormat ||
    drawDefinition.tieFormat ||
    event.tieFormat ||
    undefined;

  return {
    relevantAssignments,
    collectionPosition,
    teamParticipants,
    collectionId,
    matchUpType,
    dualMatchUp,
    tieMatchUp,
    tieFormat,
    structure,
    ...SUCCESS,
  };
}
