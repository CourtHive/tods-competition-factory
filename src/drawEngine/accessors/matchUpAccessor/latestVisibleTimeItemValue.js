export function latestVisibleTimeItemValue(
  timeItems,
  itemType,
  visibilityThreshold
) {
  const getTimeStamp = (item) =>
    !item.createdAt ? 0 : new Date(item.createdAt).getTime();
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

  return latestVisible && latestVisible.itemValue;
}
