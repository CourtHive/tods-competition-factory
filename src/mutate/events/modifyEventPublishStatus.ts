import { addEventTimeItem } from '../timeItems/addTimeItem';
import { getEventPublishStatus } from '../../query/event/getEventPublishStatus';
import { isObject } from '../../tools/objects';

import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { Event } from '../../types/tournamentTypes';

type ModifyEventPublishStatus = {
  statusObject: { [key: string]: any };
  removePriorValues?: boolean;
  status?: string;
  event: Event;
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
