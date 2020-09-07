import { START_TIME } from 'src/constants/timeItemConstants';

export function matchUpStartTime({matchUp}) {
  const timeItems = matchUp.timeItems || [];
  const startTimeItem = timeItems.reduce((startTimeItem, timeItem) => {
    const startTimeCandidate = timeItem.itemSubject === START_TIME && timeItem;
    const earlierStartTimeItem = (
      startTimeCandidate &&
        (
          !startTimeItem
          || new Date(startTimeCandidate.itemValue) < new Date(startTimeItem.itemValue)
        )
      );
    return earlierStartTimeItem ? startTimeCandidate : startTimeItem;
  }, undefined);

  const startTime = startTimeItem && startTimeItem.itemValue;

  return { startTime };
}
