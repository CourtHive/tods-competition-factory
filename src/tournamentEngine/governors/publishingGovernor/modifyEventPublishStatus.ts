import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventPublishStatus } from './getEventPublishStatus';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';

export function modifyEventPublishStatus({
  removePriorValues = true,
  status = PUBLIC,
  attribute,
  values,
  event,
}) {
  const pubState = getEventPublishStatus({ event, status });
  const itemType = `${PUBLISH}.${STATUS}`;
  const updatedTimeItem = {
    itemValue: { [status]: { ...pubState, [attribute]: values } },
    itemType,
  };
  return addEventTimeItem({
    timeItem: updatedTimeItem,
    removePriorValues,
    event,
  });
}
