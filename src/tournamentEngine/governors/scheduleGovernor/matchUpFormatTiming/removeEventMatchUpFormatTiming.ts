import { removeEventExtension } from '../../tournamentGovernor/addRemoveExtensions';

import { MISSING_EVENT } from '../../../../constants/errorConditionConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';

export function removeEventMatchUpFormatTiming({ event }) {
  if (!event) return { error: MISSING_EVENT };

  return removeEventExtension({ event, name: SCHEDULE_TIMING });
}
