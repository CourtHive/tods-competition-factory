import { matchUpActions as tournamentMatchUpActions } from '../../../tournamentEngine/getters/matchUpActions';
import { findEvent } from '../../../tournamentEngine/getters/findEvent';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  PolicyDefinitions,
  TournamentRecordsArgs,
} from '../../../types/factoryTypes';

type MatchUpActionsArgs = TournamentRecordsArgs & {
  policyDefinitions?: PolicyDefinitions;
  enforceGender?: boolean;
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
    policyDefinitions,
    enforceGender,
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
    policyDefinitions,
    tournamentRecord,
    enforceGender,
    participantId,
    sideNumber,
    matchUpId,
    drawId,
  });
}
