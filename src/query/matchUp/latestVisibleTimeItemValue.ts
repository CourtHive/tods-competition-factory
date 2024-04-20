import { TimeItem } from '@Types/tournamentTypes';

function getTimeStamp(item) {
  return !item.createdAt ? 0 : new Date(item.createdAt).getTime();
}

type LastVisibleTimeItemValueArgs = {
  visibilityThreshold?: string;
  timeItems: TimeItem[];
  itemType: string;
};
export function latestVisibleTimeItemValue({ visibilityThreshold, timeItems, itemType }: LastVisibleTimeItemValueArgs) {
  const latestVisible = timeItems
    .filter(
      (timeItem) =>
        timeItem &&
        timeItem.itemType === itemType &&
        (!visibilityThreshold || getTimeStamp(timeItem) < new Date(visibilityThreshold).getTime()),
    )
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  const timeStamp = latestVisible && getTimeStamp(latestVisible);

  return { itemValue: latestVisible?.itemValue, timeStamp };
}
