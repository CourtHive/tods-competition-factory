import { attachPolicies } from '../../../../drawEngine/governors/policyGovernor/attachPolicies';
import { modifyDrawNotice } from '../../../../drawEngine/notifications/drawNotifications';
import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { isObject } from '../../../../utilities/objects';
import { modifyDrawName } from './modifyDrawName';

import { ResultType } from '../../../../global/functions/decorateResult';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { PolicyDefinitions } from '../../../../types/factoryTypes';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../../types/tournamentFromSchema';
import {
  INVALID_END_TIME,
  MISSING_DRAW_DEFINITION,
} from '../../../../constants/errorConditionConstants';

type ModifyDrawArgs = {
  drawUpdates: { drawName: string; policyDefinitions: PolicyDefinitions };
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  drawId: string;
  event: Event;
};
export function modifyDrawDefinition({
  tournamentRecord,
  drawDefinition,
  drawUpdates,
  drawId,
  event,
}: ModifyDrawArgs): ResultType {
  if (!isObject(drawUpdates)) return { error: INVALID_END_TIME };

  const flightProfile = getFlightProfile({ event }).flightProfile;

  const nameResult: any =
    drawUpdates.drawName &&
    modifyDrawName({
      drawName: drawUpdates.drawName,
      tournamentRecord,
      drawDefinition,
      flightProfile,
      drawId,
      event,
    });
  if (nameResult?.error) return nameResult?.error;

  const flight =
    nameResult?.flight ||
    flightProfile?.flights?.find((flight) => flight.drawId === drawId);

  if (!flight && !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  if (flight) {
    // TODO: any relevant changes to flightProfile
    const extension = {
      name: FLIGHT_PROFILE,
      value: {
        ...flightProfile,
        flights: flightProfile.flights,
      },
    };

    addEventExtension({ event, extension });
  }

  if (drawDefinition) {
    if (drawUpdates.policyDefinitions) {
      attachPolicies({
        policyDefinitions: drawUpdates.policyDefinitions,
        drawDefinition,
      });
    }
    // TODO: any relevant changes to drawDefinition
    modifyDrawNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
    });
  }

  return { ...SUCCESS };
}
