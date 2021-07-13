import { addTournamentExtension } from '../tournamentGovernor/addRemoveExtensions';

import {
  INVALID_OBJECT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';

export function setMatchUpDailyLimits({ tournamentRecord, dailyLimits }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof dailyLimits !== 'object') return { error: INVALID_OBJECT };

  const result = addTournamentExtension({
    tournamentRecord,
    extension: { name: SCHEDULE_LIMITS, value: { dailyLimits } },
  });
  return result;
}
