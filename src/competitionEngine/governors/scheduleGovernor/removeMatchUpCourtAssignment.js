import { assignMatchUpCourt } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

import { SUCCESS } from '../../../constants/resultConstants';

export function removeMatchUpCourtAssignment(params) {
  const { tournamentRecords, deepCopy } = params;
  const { tournamentId, drawId, matchUpId } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  const { drawDefinition } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });

  return assignMatchUpCourt({
    drawDefinition,
    matchUpId,
    courtId,
    courtDayDate,
  });
}
