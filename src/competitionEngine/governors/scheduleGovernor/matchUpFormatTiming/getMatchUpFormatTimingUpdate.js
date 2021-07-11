import { getExtensionUpdate } from '../../competitionsGovernor/getExtensionUpdate';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';

export function getMatchUpFormatTimingUpdate({ tournamentRecords }) {
  return getExtensionUpdate({
    tournamentRecords,
    extensionName: SCHEDULE_TIMING,
  });
}
