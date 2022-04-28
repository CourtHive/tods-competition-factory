import { getEligibleVoluntaryConsolationParticipants as getEligible } from '../../../drawEngine/governors/queryGovernor/getEligibleVoluntaryConsolationParticipants';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function getEligibleVoluntaryConsolationParticipants({
  finishingRoundLimit,
  tournamentRecord,
  drawDefinition,
  winsLimit,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return getEligible({
    finishingRoundLimit,
    tournamentRecord,
    drawDefinition,
    winsLimit,
  });
}
