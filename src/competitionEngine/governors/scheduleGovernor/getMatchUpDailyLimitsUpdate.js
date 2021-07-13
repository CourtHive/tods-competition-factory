import { getExtensionUpdate } from '../competitionsGovernor/getExtensionUpdate';

import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';

export function getMatchUpDailyLimitsUpdate({ tournamentRecords }) {
  return getExtensionUpdate({
    tournamentRecords,
    extensionName: SCHEDULE_LIMITS,
  });
}
