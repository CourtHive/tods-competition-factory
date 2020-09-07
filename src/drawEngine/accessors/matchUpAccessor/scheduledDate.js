import { SCHEDULED_DATE } from 'competitionFactory/constants/timeItemConstants';

export function scheduledMatchUpDate({matchUp}) {
  const timeItems = matchUp.timeItems || [];
  const scheduledDateItem = timeItems.reduce((scheduledDateItem, timeItem) => {
    const scheduledDateCandidate = timeItem.itemSubject === SCHEDULED_DATE && timeItem;
    const laterScheduledTimeItem = (
      scheduledDateCandidate &&
        (
          !scheduledDateItem
          || new Date(scheduledDateCandidate.itemValue) > new Date(scheduledDateItem.itemValue)
        )
      );
    return laterScheduledTimeItem ? scheduledDateCandidate : scheduledDateItem;
  }, undefined);

  const scheduledDate = scheduledDateItem && scheduledDateItem.itemValue;

  return { scheduledDate };
}

