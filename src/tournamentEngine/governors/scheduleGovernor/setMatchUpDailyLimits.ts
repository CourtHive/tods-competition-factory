import { addTournamentExtension } from '../tournamentGovernor/addRemoveExtensions';

import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';
import {
  INVALID_OBJECT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function setMatchUpDailyLimits({ tournamentRecord, dailyLimits }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof dailyLimits !== 'object') return { error: INVALID_OBJECT };

  return addTournamentExtension({
    extension: { name: SCHEDULE_LIMITS, value: { dailyLimits } },
    tournamentRecord,
  });
}
