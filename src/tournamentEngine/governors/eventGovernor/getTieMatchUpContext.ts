import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getMatchUpsMap } from '../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { extractAttributes } from '../../../utilities';

import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { TEAM } from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  EVENT_NOT_FOUND,
  ErrorType,
  INVALID_MATCHUP,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  MatchUp,
  Participant,
  Structure,
  TieFormat,
} from '../../../types/tournamentFromSchema';

// for a given tieMatchUpId (SINGLES or DOUBLES) return:
// the tieMatchUp, the dualMatchUp within which it occurs, an inContext copy of the dualMatchUp
// the tieFormat, collectionId and collectionPosition & etc.
export function getTieMatchUpContext({
  tournamentRecord,
  drawDefinition,
  tieMatchUpId,
  event,
}): {
  inContextDualMatchUp?: HydratedMatchUp;
  inContextTieMatchUp?: HydratedMatchUp;
  teamParticipants?: Participant[];
  relevantAssignments?: any[];
  collectionPosition?: number;
  drawPositions?: number[];
  tieFormat?: TieFormat;
  collectionId?: string;
  dualMatchUp?: MatchUp;
  matchUpTieId?: string;
  structure?: Structure;
  matchUpType?: string;
  tieMatchUp?: MatchUp;
  error?: ErrorType;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!event) return { error: EVENT_NOT_FOUND };

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  // tieMatchUp is matchUpType: SINGLES or DOUBLES
  const { matchUp: tieMatchUp } = findMatchUp({
    matchUpId: tieMatchUpId,
    drawDefinition,
    matchUpsMap,
  });
  if (!tieMatchUp) return { error: MATCHUP_NOT_FOUND };

  const { matchUp: inContextTieMatchUp, structure } = findMatchUp({
    tournamentParticipants: tournamentRecord.participants,
    matchUpId: tieMatchUpId,
    inContext: true,
    drawDefinition,
    matchUpsMap,
    event,
  });
  if (!inContextTieMatchUp) return { error: MATCHUP_NOT_FOUND };

  const {
    collectionPosition,
    drawPositions,
    collectionId,
    matchUpTieId,
    matchUpType,
  } = inContextTieMatchUp;

  if (matchUpType && ![SINGLES, DOUBLES].includes(matchUpType))
    return { error: INVALID_MATCHUP };

  const { positionAssignments } = getPositionAssignments({ structure });
  const relevantAssignments = positionAssignments?.filter(
    (assignment) => drawPositions?.includes(assignment.drawPosition)
  );

  const participantIds = relevantAssignments?.map(
    extractAttributes('participantId')
  );
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

  const { matchUp: inContextDualMatchUp } = findMatchUp({
    matchUpId: matchUpTieId,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });

  const tieFormat = resolveTieFormat({
    matchUp: dualMatchUp,
    drawDefinition,
    structure,
    event,
  })?.tieFormat;

  return {
    inContextDualMatchUp,
    inContextTieMatchUp,
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
