export function latestVisibleTimeItemValue(
  timeItems,
  itemType,
  visibilityThreshold
) {
  const getTimeStamp = (item) =>
    !item.createdAt ? 0 : new Date(item.createdAt).getTime();
  const latestVisible = timeItems
    .filter(
      (timeItem) =>
        timeItem &&
        timeItem.itemType === itemType &&
        (!visibilityThreshold ||
          getTimeStamp(timeItem).getTime() < visibilityThreshold)
    )
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  return latestVisible && latestVisible.itemValue;
}
