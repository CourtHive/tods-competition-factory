import { saveTournamentRecords } from './saveTournamentRecords';
import { governors } from '../../../../assemblies/governors';

import { TournamentRecords } from '../../../../types/factoryTypes';
import { Tournament } from '../../../../types/tournamentTypes';
import { SUCCESS } from '../../common/constants/app';

export function generateTournamentRecord(mockProfile?: any) {
  const mockResult = governors.mocksGovernor.generateTournamentRecord(mockProfile);

  if (!mockResult || mockResult.error) {
    throw new Error(mockResult?.error || 'Could not generate tournament record');
  }

  const tournamentRecord: Tournament = mockResult.tournamentRecord;
  const tournamentRecords: TournamentRecords = { [tournamentRecord.tournamentId]: tournamentRecord };
  saveTournamentRecords({ tournamentRecords });

  return { tournamentRecord, ...SUCCESS };
}
