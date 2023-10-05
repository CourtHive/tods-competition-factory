import { modifyTieFormat as method } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyTieFormat';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function modifyTieFormat(params) {
  return resolveTournamentRecord({ ...params, method });
}
