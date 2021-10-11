import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { makeDeepCopy } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function attachFlightProfile({ flightProfile, event }) {
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
