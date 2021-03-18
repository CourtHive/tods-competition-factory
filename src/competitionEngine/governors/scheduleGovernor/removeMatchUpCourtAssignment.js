import { assignMatchUpCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

export function removeMatchUpCourtAssignment(params) {
  const { tournamentRecords } = params;
  const { tournamentId, drawId, matchUpId, courtDayDate } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
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
