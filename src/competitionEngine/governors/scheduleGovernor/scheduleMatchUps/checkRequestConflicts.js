import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';
import {
  addMinutes,
  extractTime,
  sameDay,
  timeToDate,
} from '../../../../utilities/dateTime';
import { getIndividualParticipants } from './getIndividualParticipants';

/**
 *
 * @param {string} date - 'YYYY-MM-DD' date string
 * @param {object} matchUp - matchUp being checked
 * @param {string} scheduleTime - time being checked
 * @param {number} averageMatchUpMinutes - number of minutes matchUp is expected to last
 *
 * @param {object} requestConflicts - trackis per-matchUp conflicts { [requestId]: { scheduleTimes, matchUpIds }}
 * @param {boolean} potentials - whether to consdier potential participants when determining conflicts
 * @param {object} personRequests - contains personRequests { [personId]: [request] }
 *
 * @returns
 */
export function checkRequestConflicts({
  averageMatchUpMinutes,
  requestConflicts = {},
  potentials = true,
  personRequests,
  scheduleTime,
  matchUp,
  date,
}) {
  const personIds = getIndividualParticipants(matchUp).map(
    ({ person }) => person?.personId
  );
  if (potentials) {
    const potentialPersonIds = (matchUp?.potentialParticipants || [])
      .flat()
      .map(({ person }) => person?.personId);
    personIds.push(...potentialPersonIds);
  }

  const relevantPersonRequests = personIds
    .map((personId) =>
      personRequests[personId]?.map((request) =>
        Object.assign({}, request, { personId })
      )
    )
    .filter((f) => f)
    .flat()
    .filter(
      (request) =>
        request.requestType === DO_NOT_SCHEDULE && sameDay(date, request.date)
    );

  const conflicts = [];
  const matchUpId = matchUp?.matchUpId;
  const scheduleStart = timeToDate(scheduleTime, date);
  const averageEnd = extractTime(
    addMinutes(scheduleStart, averageMatchUpMinutes).toISOString()
  );

  // scheduleTime, averageEnd, startTime and endTime are all string format '00:00'
  // string comparison < > is used to determine...
  // ...if either schedultTime or averageEnd falls between request startTime and endTime
  for (const request of relevantPersonRequests) {
    const { requestId, startTime, endTime } = request;
    const conflict =
      (scheduleTime > startTime && scheduleTime < endTime) ||
      (averageEnd > startTime && averageEnd < endTime);
    if (conflict) {
      conflicts.push({ matchUpId, request, scheduleTime });
      if (!requestConflicts[requestId]) {
        requestConflicts[requestId] = {
          request,
          scheduleTimes: [scheduleTime],
          matchUpIds: [matchUpId],
        };
      } else {
        if (!requestConflicts[requestId].scheduleTimes.includes(scheduleTime))
          requestConflicts[requestId].scheduleTimes.push(scheduleTime);
        if (!requestConflicts[requestId].matchUpIds.includes(matchUpId))
          requestConflicts[requestId].matchUpIds.push(matchUpId);
      }
    }
  }

  return { conflicts };
}
