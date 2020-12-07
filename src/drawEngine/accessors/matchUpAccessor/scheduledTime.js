import { getTimeZoneOffset } from '../../../utilities/dateTime';
import { SCHEDULED_TIME } from '../../../constants/timeItemConstants';

export function scheduledMatchUpTime({
  matchUp,
  localTimeZone,
  localPerspective,
}) {
  const timeItems = matchUp.timeItems || [];
  const getTimeStamp = item => (!item ? 0 : new Date(item.createdAt).getTime());
  const lastScheduledTimeItem = timeItems
    .filter(timeItem => timeItem.itemSubject === SCHEDULED_TIME)
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  const itemValue = lastScheduledTimeItem && lastScheduledTimeItem.itemValue;

  if (localPerspective && localTimeZone) {
    const { offsetDate, error } = getTimeZoneOffset({
      date: itemValue,
      timeZone: localTimeZone,
    });
    if (error) return { error };
    return { scheduledTime: offsetDate };
  }

  return { scheduledTime: itemValue };
}
