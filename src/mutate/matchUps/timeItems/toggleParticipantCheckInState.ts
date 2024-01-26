import { getCheckedInParticipantIds } from '../../../query/matchUp/getCheckedInParticipantIds';
import { checkRequiredParameters } from '../../../helpers/parameters/checkRequiredParameters';
import { resolveFromParameters } from '../../../helpers/parameters/resolveFromParameters';
import { checkOutParticipant } from './checkOutParticipant';
import { checkInParticipant } from './checkInParticipant';

import { MATCHUP_NOT_FOUND, MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { DrawDefinition, Tournament } from '../../../types/tournamentTypes';
import { TournamentRecords } from '../../../types/factoryTypes';
import {
  DRAW_DEFINITION,
  ERROR,
  MATCHUP,
  MATCHUP_ID,
  PARAM,
  PARTICIPANT_ID,
} from '../../../constants/attributeConstants';

type ToggleParticipantCheckInStateArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  activeTournamentId?: string;
  participantId: string;
  tournamentId?: string;
  matchUpIds?: string[];
  matchUpId: string;
};

export function toggleParticipantCheckInState(params: ToggleParticipantCheckInStateArgs) {
  const paramCheck = checkRequiredParameters(params, [
    { [PARTICIPANT_ID]: true, [DRAW_DEFINITION]: true, [MATCHUP_ID]: true },
  ]);
  if (paramCheck.error) return paramCheck;

  const tournamentId = params.tournamentId ?? params.activeTournamentId;
  const tournamentRecord = params.tournamentRecord ?? (tournamentId && params.tournamentRecords?.[tournamentId]);

  const { participantId, matchUpId, drawDefinition } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const resolutions = resolveFromParameters(params, [{ [PARAM]: MATCHUP, [ERROR]: MATCHUP_NOT_FOUND }]);
  const matchUp = resolutions.matchUp?.matchUp;
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const { checkedInParticipantIds = [] } = getCheckedInParticipantIds({
    matchUp,
  });

  if (participantId && checkedInParticipantIds.includes(participantId)) {
    return checkOutParticipant({
      tournamentRecord,
      drawDefinition,
      participantId,
      matchUpId,
      matchUp,
    });
  } else {
    return checkInParticipant({
      tournamentRecord,
      drawDefinition,
      participantId,
      matchUpId,
      matchUp,
    });
  }
}
