import { generateVoluntaryConsolation as generateVoluntary } from '../../../drawEngine/governors/structureGovernor/generateVoluntaryConsolation';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function generateVoluntaryConsolation(params) {
  const { tournamentRecord } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentParticipants = tournamentRecord.participants;

  return generateVoluntary({ participants: tournamentParticipants, ...params });
}
