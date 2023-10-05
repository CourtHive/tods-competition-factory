import { removeCollectionGroup as method } from '../../../matchUpEngine/governors/tieFormatGovernor/removeCollectionGroup';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function removeCollectionGroup(params) {
  return resolveTournamentRecord({ ...params, method });
}
