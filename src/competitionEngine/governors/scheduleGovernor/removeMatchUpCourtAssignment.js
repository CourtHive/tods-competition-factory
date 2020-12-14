import { assignMatchUpCourt } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
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
    drawDefinition,
    matchUpId,
    courtId: '',
    courtDayDate,
  });
}
