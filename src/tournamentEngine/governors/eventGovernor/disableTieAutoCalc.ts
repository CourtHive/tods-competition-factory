import { disableTieAutoCalc as drawEngineDisableTieAutoCalc } from '../../../mutate/matchUps/extensions/disableTieAutoCalc';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function disableTieAutoCalc(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return drawEngineDisableTieAutoCalc(params);
}
