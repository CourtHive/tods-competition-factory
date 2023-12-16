import { addCollectionDefinition as method } from '../../../mutate/tieFormat/addCollectionDefinition';
import { resolveTournamentRecord } from '../../accessors/resolveTournamentRecord';

export function addCollectionDefinition(params) {
  return resolveTournamentRecord({ ...params, method });
}
