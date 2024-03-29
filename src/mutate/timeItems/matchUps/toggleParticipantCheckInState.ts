import { getCheckedInParticipantIds } from '@Query/matchUp/getCheckedInParticipantIds';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { resolveFromParameters } from '@Helpers/parameters/resolveFromParameters';
import { checkOutParticipant } from './checkOutParticipant';
import { checkInParticipant } from './checkInParticipant';

// constants and types
import { MATCHUP_NOT_FOUND, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { DrawDefinition, Tournament } from '@Types/tournamentTypes';
import { TournamentRecords } from '@Types/factoryTypes';
import {
  DRAW_DEFINITION,
  ERROR,
  IN_CONTEXT,
  MATCHUP,
  MATCHUP_ID,
  PARAM,
  PARTICIPANT_ID,
} from '@Constants/attributeConstants';

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

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const resolutions = resolveFromParameters(params, [
    { [PARAM]: MATCHUP, attr: { [IN_CONTEXT]: true }, [ERROR]: MATCHUP_NOT_FOUND },
  ]);
  const matchUp = resolutions.matchUp?.matchUp;
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const { checkedInParticipantIds = [] } = getCheckedInParticipantIds({
    matchUp,
  });

  const { participantId, matchUpId, drawDefinition } = params;
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
