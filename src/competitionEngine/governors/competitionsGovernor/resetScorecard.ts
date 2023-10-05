import { resetScorecard as method } from '../../../drawEngine/governors/matchUpGovernor/resetScorecard';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function resetScorecard(params) {
  return resolveTournamentRecord({ ...params, method });
}
