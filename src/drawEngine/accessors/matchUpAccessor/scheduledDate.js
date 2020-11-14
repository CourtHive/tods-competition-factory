import { getTimeZoneOffset } from '../../../utilities/dateTime';
import { SCHEDULED_DATE } from '../../../constants/timeItemConstants';

export function scheduledMatchUpDate({
  matchUp,
  localTimeZone,
  localPerspective,
}) {
  const timeItems = matchUp.timeItems || [];
  const scheduledDateItem = timeItems.reduce((scheduledDateItem, timeItem) => {
    const scheduledDateCandidate =
      timeItem.itemSubject === SCHEDULED_DATE && timeItem;
    const laterScheduledTimeItem =
      scheduledDateCandidate &&
      (!scheduledDateItem ||
        new Date(scheduledDateCandidate.itemValue) >
          new Date(scheduledDateItem.itemValue));
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
