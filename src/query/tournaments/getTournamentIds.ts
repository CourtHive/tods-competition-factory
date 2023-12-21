import { SUCCESS } from '../../constants/resultConstants';

export function getTournamentIds({ tournamentRecords }) {
  const tournamentIds = Object.keys(tournamentRecords).filter(Boolean);
  return { tournamentIds, ...SUCCESS };
}
