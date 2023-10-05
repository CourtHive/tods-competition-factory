import { removeCollectionDefinition as method } from '../../../matchUpEngine/governors/tieFormatGovernor/removeCollectionDefinition';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function removeCollectionDefinition(params) {
  return resolveTournamentRecord({ ...params, method });
}
