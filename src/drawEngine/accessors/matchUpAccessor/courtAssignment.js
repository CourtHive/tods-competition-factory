import { COURT } from '../../../constants/timeItemConstants';

export function matchUpAssignedCourtId({ matchUp }) {
  const timeItems = matchUp.timeItems || [];
  const getTimeStamp = item => (!item ? 0 : new Date(item.timeStamp).getTime());
  const lastCourtAssignmentItem = timeItems
    .filter(timeItem => timeItem.itemSubject === COURT)
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  const courtId = lastCourtAssignmentItem && lastCourtAssignmentItem.itemValue;

  return { courtId };
}
