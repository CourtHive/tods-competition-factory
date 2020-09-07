import { SCHEDULED_TIME } from 'competitionFactory/constants/timeItemConstants';

export function scheduledMatchUpTime({matchUp}) {
  const timeItems = matchUp.timeItems || [];
  const getTimeStamp = item => !item ? 0 : new Date(item.timeStamp).getTime();
  const lastScheduledTimeItem = timeItems
    .filter(timeItem => timeItem.itemSubject === SCHEDULED_TIME)
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  const scheduledTime = lastScheduledTimeItem && lastScheduledTimeItem.itemValue;

  return { scheduledTime };
}
