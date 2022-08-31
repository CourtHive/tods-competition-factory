import { getExtensionUpdate } from '../competitionsGovernor/getExtensionUpdate';

import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';

export function getMatchUpDailyLimitsUpdate({ tournamentRecords }) {
  return getExtensionUpdate({
    extensionName: SCHEDULE_LIMITS,
    tournamentRecords,
  });
}
