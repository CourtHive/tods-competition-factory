import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { decorateResult } from '../../../global/functions/decorateResult';
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
  const stack = 'attachFlightProfile';
  if (!flightProfile)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  if (!event)
    return decorateResult({ result: { error: MISSING_EVENT }, stack });

  const { flightProfile: existingFlightProfile } = getFlightProfile({ event });
  if (existingFlightProfile && !deleteExisting)
    return decorateResult({ result: { error: EXISTING_PROFILE }, stack });

  if (event.drawDefinitions?.length)
    return decorateResult({
      result: { error: EXISTING_DRAW_DEFINITIONS },
      stack,
    });

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
