import { modifyCollectionDefinition as method } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyCollectionDefinition';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function modifyCollectionDefinition(params) {
  return resolveTournamentRecord({ ...params, method });
}
