import { deleteCourt as courtDeletion } from '../../../tournamentEngine/governors/venueGovernor/deleteCourt';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  COURT_NOT_FOUND,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function deleteCourt({ tournamentRecords, courtId, force }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof courtId !== 'string') return { error: MISSING_COURT_ID };

  let courtDeleted;
  let result;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    result = courtDeletion({ tournamentRecord, courtId, force });
    if (result.error && result.error !== COURT_NOT_FOUND) return result;
    if (result.success) courtDeleted = true;
  }

  return courtDeleted ? { ...SUCCESS } : result;
}
