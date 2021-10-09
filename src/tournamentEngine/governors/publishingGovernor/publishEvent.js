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
import { PUBLISH_EVENT } from '../../../constants/topicConstants';
import { unique } from '../../../utilities';

export function publishEvent({
  tournamentRecord,
  policyDefinitions,
  status = PUBLIC,
  structureIds = [],
  drawIdsToRemove,
  drawIdsToAdd,
  drawIds,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const itemType = `${PUBLISH}.${STATUS}`;
  const eventDrawIds = event.drawDefinitions?.map(({ drawId }) => drawId) || [];

  if (!drawIds && !drawIdsToAdd && !drawIdsToRemove) {
    drawIds = eventDrawIds;
  } else if (!drawIds && (drawIdsToAdd?.length || drawIdsToRemove?.length)) {
    const { timeItem } = getEventTimeItem({
      itemType,
      event,
    });
    drawIds = timeItem?.itemValue?.PUBLIC?.drawIds || [];
  }

  drawIds = (drawIds || []).filter(
    (drawId) => !drawIdsToRemove?.length || !drawIdsToRemove.includes(drawId)
  );
  if (drawIdsToAdd?.length) {
    drawIds = unique(
      drawIds.concat(
        ...drawIdsToAdd.filter((drawId) => eventDrawIds.includes(drawId))
      )
    );
  }

  const timeItem = {
    itemType,
    itemValue: { [status]: { drawIds, structureIds } },
  };
  addEventTimeItem({ event, timeItem });

  const { eventData } = getEventData({
    policyDefinitions,
    tournamentRecord,
    event,
  });

  // filter out drawData for unpublished draws
  const publishState = eventData?.eventInfo?.publish?.state;
  eventData.drawsData = eventData.drawsData.filter(({ drawId }) =>
    publishState?.PUBLIC?.drawIds.includes(drawId)
  );

  addNotice({ topic: PUBLISH_EVENT, payload: { eventData } });

  return { ...SUCCESS, eventData };
}
