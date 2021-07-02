import { toggleParticipantCheckInState as toggle } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/toggleParticipantCheckInState';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { MISSING_VALUE } from '../../../constants/errorConditionConstants';

export function toggleParticipantCheckInState(params) {
  const { tournamentRecords } = params;
  const { participantId, tournamentId, matchUpId, drawId } = params;
  if (!tournamentRecords || !tournamentId || !participantId || !matchUpId)
    return { error: MISSING_VALUE };

  const tournamentRecord = tournamentRecords[tournamentId];
  const { drawDefinition } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  Object.assign(params, { drawDefinition, tournamentRecord });

  return toggle(params);
}
