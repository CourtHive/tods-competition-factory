import { matchUpActions as tournamentMatchUpActions } from '../../../tournamentEngine/getters/matchUpActions';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import { TournamentRecordsArgs } from '../../../types/factoryTypes';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

type MatchUpActionsArgs = TournamentRecordsArgs & {
  participantId: string;
  tournamentId: string;
  sideNumber?: number;
  matchUpId: string;
  eventId?: string;
  drawId: string;
};
export function matchUpActions(params?: MatchUpActionsArgs) {
  const {
    tournamentRecords,
    participantId,
    tournamentId,
    sideNumber,
    matchUpId,
    eventId,
    drawId,
  } = params ?? {};

  if (
    typeof tournamentRecords !== 'object' ||
    typeof tournamentId !== 'string' ||
    typeof matchUpId !== 'string' ||
    typeof drawId !== 'string'
  )
    return { error: INVALID_VALUES };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = findEvent({
    tournamentRecord,
    eventId,
    drawId,
  });
  if (result.error) return result;

  return tournamentMatchUpActions({
    drawDefinition: result.drawDefinition,
    tournamentRecord,
    participantId,
    sideNumber,
    matchUpId,
    drawId,
  });
}
