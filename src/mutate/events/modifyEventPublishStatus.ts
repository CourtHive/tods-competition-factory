import { addEventTimeItem } from '../timeItems/addTimeItem';
import { getEventPublishStatus } from '@Query/event/getEventPublishStatus';
import { isObject } from '@Tools/objects';

import { PUBLIC, PUBLISH, STATUS } from '@Constants/timeItemConstants';
import { INVALID_VALUES } from '@Constants/errorConditionConstants';
import { Event } from '@Types/tournamentTypes';

type ModifyEventPublishStatus = {
  statusObject: { [key: string]: any };
  removePriorValues?: boolean;
  status?: string;
  event?: Event;
};

export function modifyEventPublishStatus({
  removePriorValues = true,
  status = PUBLIC,
  statusObject,
  event,
}: ModifyEventPublishStatus) {
  if (!isObject(statusObject)) return { error: INVALID_VALUES };
  const publishStatus = getEventPublishStatus({ event, status });
  const itemType = `${PUBLISH}.${STATUS}`;
  const updatedTimeItem = {
    itemValue: { [status]: { ...publishStatus, ...statusObject } },
    itemType,
  };

  return addEventTimeItem({
    timeItem: updatedTimeItem,
    removePriorValues,
    event,
  });
}
