import { resetTieFormat as method } from '../../../mutate/tieFormat/resetTieFormat';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function resetTieFormat(params) {
  return resolveTournamentRecord({ ...params, method });
}
