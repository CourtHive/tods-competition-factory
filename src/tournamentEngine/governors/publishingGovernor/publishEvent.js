import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/globalState';
import { getEventData } from './getEventData';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { PUBLISH, PUBLIC, STATUS } from '../../../constants/timeItemConstants';

export function publishEvent({
  tournamentRecord,
  policyDefinition,
  status = PUBLIC,
  structureIds = [],
  drawIdsToRemove,
  drawIdsToAdd,
  drawIds,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  if (!drawIds && !drawIdsToAdd && !drawIdsToRemove) {
    drawIds = event.drawDefinitions?.map(({ drawId }) => drawId) || [];
  } else if (!drawIds && (drawIdsToAdd?.length || drawIdsToRemove?.length)) {
    const { timeItem } = getEventTimeItem({
      event,
      itemType,
    });
    drawIds = timeItem?.itemValue?.PUBLIC?.drawIds || [];
  }

  drawIds = (drawIds || []).filter(
    (drawId) => !drawIdsToRemove?.length || !drawIdsToRemove.includes(drawId)
  );
  if (drawIdsToAdd?.length) {
    drawIds = drawIds.concat(...drawIdsToAdd);
  }

  const itemType = `${PUBLISH}.${STATUS}`;

  const timeItem = {
    itemType,
    itemValue: { [status]: { drawIds, structureIds } },
  };
  const result = addEventTimeItem({ event, timeItem });
  if (result.error) return { error: result.error };

  const { eventData } = getEventData({
    tournamentRecord,
    policyDefinition,
    event,
  });

  // filter out drawData for unpublished draws
  const publishState = eventData?.eventInfo?.publish?.state;
  eventData.drawsData = eventData.drawsData.filter(({ drawId }) =>
    publishState?.PUBLIC?.drawIds.includes(drawId)
  );

  addNotice({ topic: 'publishEvent', payload: { eventData } });

  return Object.assign({}, SUCCESS, { eventData });
}
