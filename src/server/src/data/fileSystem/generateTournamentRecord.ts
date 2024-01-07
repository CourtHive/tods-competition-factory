import { saveTournamentRecords } from './saveTournamentRecords';
import { governors } from 'tods-competition-factory';

import { SUCCESS } from '../../common/constants/app';

export function generateTournamentRecord(mockProfile?: any) {
  const mockResult = governors.mocksGovernor.generateTournamentRecord(mockProfile);

  if (!mockResult || mockResult.error) {
    throw new Error(mockResult?.error || 'Could not generate tournament record');
  }

  const { tournamentRecord } = mockResult;
  saveTournamentRecords({
    tournamentRecords: { [tournamentRecord.tournamentId]: tournamentRecord }
  });

  return { tournamentRecord, ...SUCCESS };
}
