import { enableTieAutoCalc as drawEngineEnableTieAutoCalc } from '../../../drawEngine/governors/matchUpGovernor/enableTieAutoCalc';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function enableTieAutoCalc(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return drawEngineEnableTieAutoCalc(params);
}
