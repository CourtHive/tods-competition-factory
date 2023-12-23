import { generateQualifyingStructure as generateQualifying } from '../../assemblies/generators/drawDefinitions/drawTypes/generateQualifyingStructure';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

export function generateQualifyingStructure(params) {
  const { tournamentRecord } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentParticipants = tournamentRecord.participants;

  return generateQualifying({
    participants: tournamentParticipants,
    ...params,
  });
}
