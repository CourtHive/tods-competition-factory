import { resetTieFormat as method } from '../../../tournamentEngine/governors/eventGovernor/resetTieFormat';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function resetTieFormat(params) {
  return resolveTournamentRecord({ ...params, method });
}
