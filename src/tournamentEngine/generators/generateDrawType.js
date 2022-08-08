import { generateDrawType as genDrawType } from '../../drawEngine/governors/structureGovernor/generateDrawType';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

export function generateDrawType(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return genDrawType(params);
}
