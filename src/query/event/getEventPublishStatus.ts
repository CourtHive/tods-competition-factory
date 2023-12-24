import { getEventTimeItem } from '../base/timeItems';

import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';

export function getEventPublishStatus({ event, status = PUBLIC }) {
  const itemType = `${PUBLISH}.${STATUS}`;
  return getEventTimeItem({
    itemType,
    event,
  })?.timeItem?.itemValue?.[status];
}
