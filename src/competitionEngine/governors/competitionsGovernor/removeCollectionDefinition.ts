import { removeCollectionDefinition as method } from '../../../mutate/tieFormat/removeCollectionDefinition';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function removeCollectionDefinition(params) {
  return resolveTournamentRecord({ ...params, method });
}
