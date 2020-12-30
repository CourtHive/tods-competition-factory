import { getTimeZoneOffset } from '../../../utilities/dateTime';
import { SCHEDULED_DATE } from '../../../constants/timeItemConstants';

export function scheduledMatchUpDate({
  matchUp,
  localTimeZone,
  localPerspective,
}) {
  const timeItems = matchUp.timeItems || [];
  const getTimeStamp = (item) =>
    !item.createdAt ? 0 : new Date(item.createdAt).getTime();
  const scheduledDateItem = timeItems.reduce((scheduledDateItem, timeItem) => {
    const scheduledDateCandidate =
      timeItem.itemType === SCHEDULED_DATE && timeItem;
    const laterScheduledTimeItem =
      scheduledDateCandidate &&
      (!scheduledDateItem ||
        getTimeStamp(scheduledDateCandidate) > getTimeStamp(scheduledDateItem));
    return laterScheduledTimeItem ? scheduledDateCandidate : scheduledDateItem;
  }, undefined);

  const itemValue = scheduledDateItem && scheduledDateItem.itemValue;

  if (localPerspective && localTimeZone) {
    const { offsetDate, error } = getTimeZoneOffset({
      date: itemValue,
      timeZone: localTimeZone,
    });
    if (error) return { error };
    return { scheduledTime: offsetDate };
  }

  return { scheduledDate: itemValue };
}
