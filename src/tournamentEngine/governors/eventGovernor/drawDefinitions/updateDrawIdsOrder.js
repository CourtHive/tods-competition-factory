import { getFlightProfile } from '../../../getters/getFlightProfile';
import { intersection, unique } from '../../../../utilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

/**
 *
 * @param {object} orderedDrawIdsMap - required - mapping of ALL present drawIds => { [drawId]: drawOrder }
 */
export function updateDrawIdsOrder({ event, orderedDrawIdsMap }) {
  if (typeof event !== 'object') return { error: MISSING_EVENT };
  if (!orderedDrawIdsMap)
    return { error: MISSING_VALUE, info: 'Missing drawIdsOrderMap' };
  if (typeof orderedDrawIdsMap !== 'object')
    return {
      error: INVALID_VALUES,
      info: 'orderedDrawIdsMap must be an object',
    };

  const drawOrders = Object.values(orderedDrawIdsMap);

  const validDrawOrders = drawOrders.every((drawOrder) => !isNaN(drawOrder));
  if (!validDrawOrders)
    return { error: INVALID_VALUES, info: 'drawOrder must be numeric' };

  if (unique(drawOrders).length !== drawOrders.length)
    return {
      error: INVALID_VALUES,
      info: 'drawOrder values must be unique',
    };

  if (event.drawDefinitions?.length) {
    const drawIds = (event.drawDefinitions || []).map(({ drawId }) => drawId);
    const orderedDrawIds = Object.keys(orderedDrawIdsMap);
    if (
      orderedDrawIds?.length &&
      intersection(drawIds, orderedDrawIds).length !== drawIds.length
    )
      return { error: INVALID_VALUES, info: 'Missing drawIds' };

    event.drawDefinitions.forEach((drawDefinition) => {
      drawDefinition.drawOrder = orderedDrawIdsMap[drawDefinition.drawId];
    });
  }

  const { flightProfile } = getFlightProfile({ event });
  flightProfile?.flights?.forEach((flight) => {
    flight.flightNumber = orderedDrawIdsMap[flight.drawId];
  });

  return SUCCESS;
}
