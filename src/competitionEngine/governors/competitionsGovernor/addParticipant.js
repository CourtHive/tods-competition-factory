import { addParticipant as participantAdd } from '../../../tournamentEngine/governors/participantGovernor/addParticipants';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function addParticipant({
  tournamentRecords,
  tournamentId,
  participant,
}) {
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  return participantAdd({ tournamentRecord, participant });
}
