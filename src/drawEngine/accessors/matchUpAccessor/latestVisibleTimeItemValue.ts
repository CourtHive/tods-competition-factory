import { SCHEDULE } from '../../../constants/timeItemConstants';
import { TimeItem } from '../../../types/tournamentFromSchema';

function getTimeStamp(item) {
  return !item.createdAt ? 0 : new Date(item.createdAt).getTime();
}

type LastVisibleTimeItemValueArgs = {
  visibilityThreshold?: string;
  timeItems: TimeItem[];
  itemType: string;
};
export function latestVisibleTimeItemValue({
  visibilityThreshold,
  timeItems,
  itemType,
}: LastVisibleTimeItemValueArgs) {
  // TODO: should visibilityThreshold be combination of scheduled date/time

  const latestVisible = timeItems
    .filter(
      (timeItem) =>
        timeItem &&
        timeItem.itemType === itemType &&
        (!visibilityThreshold ||
          getTimeStamp(timeItem) < new Date(visibilityThreshold).getTime())
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
