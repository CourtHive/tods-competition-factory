import { intersection, unique } from '../../../../utilities';
import {
  DRAW_DEFINITION_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

/**
 *
 * @param {object} orderedDrawIdsMap - required - mapping of ALL present drawIds => { [drawId]: drawOrder }
 */
export function updateDrawIdsOrder({ event, orderedDrawIdsMap }) {
  if (!event) return { error: MISSING_EVENT };
  if (!orderedDrawIdsMap)
    return { error: MISSING_VALUE, message: 'Missing drawIdsOrderMap' };
  if (typeof orderedDrawIdsMap !== 'object')
    return {
      error: INVALID_VALUES,
      message: 'orderedDrawIdsMap must be an object',
    };

  if (!event.drawDefinitions?.length)
    return { error: DRAW_DEFINITION_NOT_FOUND };

  const drawIds = (event.drawDefinitions || []).map(({ drawId }) => drawId);
  const orderedDrawIds = Object.keys(orderedDrawIdsMap);
  if (intersection(drawIds, orderedDrawIds).length !== drawIds.length)
    return { error: INVALID_VALUES, message: 'Missing drawIds' };

  const drawOrders = Object.values(orderedDrawIdsMap);
  const validDrawOrders = drawOrders.every((drawOrder) => !isNaN(drawOrder));
  if (!validDrawOrders)
    return { error: INVALID_VALUES, message: 'drawOrder must be numeric' };

  if (unique(drawOrders).length !== drawOrders.length)
    return {
      error: INVALID_VALUES,
      message: 'drawOrder values must be unique',
    };

  event.drawDefinitions.forEach(
    (drawDefinition) =>
      (drawDefinition.drawOrder = orderedDrawIdsMap[drawDefinition.drawId])
  );

  return SUCCESS;
}
