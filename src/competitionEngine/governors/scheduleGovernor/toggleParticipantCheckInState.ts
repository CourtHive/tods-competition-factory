import { toggleParticipantCheckInState as toggle } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { findDrawDefinition } from '../../../acquire/findDrawDefinition';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';

export function toggleParticipantCheckInState(params) {
  const { tournamentRecords } = params;
  const { participantId, tournamentId, matchUpId, drawId } = params;
  if (!tournamentRecords || !tournamentId || !participantId || !matchUpId)
    return { error: MISSING_VALUE, stack: 'toggleParticipantCheckInState' };

  const tournamentRecord = tournamentRecords[tournamentId];
  const { drawDefinition, event } = findDrawDefinition({
    tournamentRecord,
    drawId,
  });
  Object.assign(params, { drawDefinition, event, tournamentRecord });

  return toggle(params);
}
