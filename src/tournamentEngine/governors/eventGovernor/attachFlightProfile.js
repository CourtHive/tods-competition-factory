import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { makeDeepCopy } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_DRAW_DEFINITIONS,
  EXISTING_PROFILE,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function attachFlightProfile({ deleteExisting, event, flightProfile }) {
  if (!flightProfile) return { error: MISSING_VALUE };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile: existingFlightProfile } = getFlightProfile({ event });
  if (existingFlightProfile && attachFlightProfile && !deleteExisting)
    return { error: EXISTING_PROFILE };

  if (event.drawDefinitions?.length)
    return { error: EXISTING_DRAW_DEFINITIONS };

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
