import { SCHEDULE } from '../../../constants/timeItemConstants';

function getTimeStamp(item) {
  return !item.createdAt ? 0 : new Date(item.createdAt).getTime();
}

export function latestVisibleTimeItemValue(
  timeItems,
  itemType,
  visibilityThreshold
) {
  // TODO: should visibilityThreshold be combination of scheduled date/time

  const latestVisible = timeItems
    .filter(
      (timeItem) =>
        timeItem &&
        timeItem.itemType === itemType &&
        (!visibilityThreshold || getTimeStamp(timeItem) < visibilityThreshold)
    )
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  const timeStamp = latestVisible && getTimeStamp(latestVisible);

  return { itemValue: latestVisible?.itemValue, timeStamp };
}

export function lastVisibleSchedule(timeItems, visibilityThreshold) {
  const item = timeItems
    .filter(
      (timeItem) =>
        timeItem &&
        timeItem.itemType === SCHEDULE &&
        (!visibilityThreshold || getTimeStamp(timeItem) < visibilityThreshold)
    )
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  const timeStamp = item && getTimeStamp(item);

  return { schedule: item?.value, timeStamp };
}
