import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
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
  drawIds,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  if (!drawIds)
    drawIds = event.drawDefinitions?.map(({ drawId }) => drawId) || [];

  const timeItem = {
    itemType: `${PUBLISH}.${STATUS}`,
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
