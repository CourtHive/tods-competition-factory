import { orderCollectionDefinitions as method } from '../../../mutate/tieFormat/orderCollectionDefinitions';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function orderCollectionDefinitions(params) {
  return resolveTournamentRecord({ ...params, method });
}
