import { addCollectionGroup as method } from '../../../matchUpEngine/governors/tieFormatGovernor/addCollectionGroup';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function addCollectionGroup(params) {
  return resolveTournamentRecord({ ...params, method });
}
