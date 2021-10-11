import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { makeDeepCopy } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function attachFlightProfile({ flightProfile, event }) {
  if (!flightProfile) return { error: MISSING_VALUE };
  if (!event) return { error: MISSING_EVENT };

  const extension = {
    name: FLIGHT_PROFILE,
    value: flightProfile,
  };

  addEventExtension({ event, extension });

  return {
    flightProfile: makeDeepCopy(flightProfile, false, true),
    ...SUCCESS,
  };
}
