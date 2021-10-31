import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

// add persons to a tournamentRecord and create participants in the process
// include ability to specify a doubles partner by personId
export function addPersons({ tournamentRecord, persons }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(persons)) return { error: INVALID_VALUES };

  return { ...SUCCESS };
}
