import { getExtensionUpdate } from '../getExtensionUpdate';

import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';

export function getMatchUpFormatTimingUpdate({ tournamentRecords }) {
  return getExtensionUpdate({
    extensionName: SCHEDULE_TIMING,
    tournamentRecords,
  });
}
