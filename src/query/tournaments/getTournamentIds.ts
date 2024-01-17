import { SUCCESS } from '../../constants/resultConstants';
import { isObject } from '../../tools/objects';

export function getTournamentIds({ tournamentRecords }) {
  const tournamentIds = isObject(tournamentRecords) ? Object.keys(tournamentRecords) : [];
  return { tournamentIds, ...SUCCESS };
}
