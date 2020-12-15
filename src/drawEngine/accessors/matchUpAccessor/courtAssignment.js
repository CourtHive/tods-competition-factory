export function matchUpAssignedCourtId({ matchUp }) {
  const timeItems = matchUp.timeItems || [];
  const getTimeStamp = (item) =>
    !item ? 0 : new Date(item.createdAt).getTime();
  const courtAssignmentItems = timeItems
    .filter((timeItem) => timeItem.itemType === `SCHEDULE.ASSIGNMENT.COURT`)
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b));

  const lastCourtAssignmentItem = courtAssignmentItems.pop();
  const courtId = lastCourtAssignmentItem && lastCourtAssignmentItem.itemValue;

  return { courtId };
}
