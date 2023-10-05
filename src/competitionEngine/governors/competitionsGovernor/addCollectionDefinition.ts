import { addCollectionDefinition as method } from '../../../matchUpEngine/governors/tieFormatGovernor/addCollectionDefinition';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function addCollectionDefinition(params) {
  return resolveTournamentRecord({ ...params, method });
}
