import { orderCollectionDefinitions as method } from '../../../matchUpEngine/governors/tieFormatGovernor/orderCollectionDefinitions';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function orderCollectionDefinitions(params) {
  return resolveTournamentRecord({ ...params, method });
}
