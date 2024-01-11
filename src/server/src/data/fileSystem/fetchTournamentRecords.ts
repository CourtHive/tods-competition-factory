import { findTournamentRecord } from './findTournamentRecord';

import { SUCCESS } from '../../common/constants/app';

export async function fetchTournamentRecords(params) {
  const tournamentIds = params?.tournamentIds ?? [params?.tournamentId].filter(Boolean);

  const tournamentRecords = {};

  let fetched = 0,
    notFound = 0;
  for (const tournamentId of tournamentIds) {
    const result = await findTournamentRecord({ tournamentId });
    if (result.tournamentRecord) {
      const tournamentId = result.tournamentRecord.tournamentId;
      tournamentRecords[tournamentId] = result.tournamentRecord;
      fetched += 1;
    } else {
      notFound += 1;
    }
  }

  if (!fetched) return { error: { message: 'No tournament records found' } };

  return { ...SUCCESS, tournamentRecords, fetched, notFound };
}
