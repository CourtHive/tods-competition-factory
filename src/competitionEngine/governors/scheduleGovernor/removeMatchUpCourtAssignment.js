import { assignMatchUpCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function removeMatchUpCourtAssignment(params) {
  const { tournamentRecords } = params;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  const { tournamentId, drawId, matchUpId, courtDayDate } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawDefinition } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });

  return assignMatchUpCourt({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    courtId: '',
    courtDayDate,
  });
}
