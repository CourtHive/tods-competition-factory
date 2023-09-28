import { resetMatchUpLineUps as drawEngineResetLineUps } from '../../../../drawEngine/governors/positionGovernor/resetMatchUpLineUps';

import { MISSING_TOURNAMENT_RECORD } from '../../../../constants/errorConditionConstants';

export function resetMatchUpLineUps(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return drawEngineResetLineUps(params);
}
