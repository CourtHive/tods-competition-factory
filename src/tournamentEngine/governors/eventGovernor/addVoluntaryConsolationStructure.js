import { addVoluntaryConsolationStructure as generateVoluntary } from '../../../drawEngine/generators/addVoluntaryConsolationStructure';
import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function addVoluntaryConsolationStructure(params) {
  const { tournamentRecord } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentParticipants = tournamentRecord.participants;

  return generateVoluntary({ participants: tournamentParticipants, ...params });
}
