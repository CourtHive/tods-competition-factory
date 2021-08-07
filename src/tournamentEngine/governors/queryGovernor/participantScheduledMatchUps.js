import {
  extractDate,
  extractTime,
  timeSort,
} from '../../../utilities/dateTime';

import {
  INVALID_VALUES,
  MISSING_MATCHUPS,
} from '../../../constants/errorConditionConstants';

export function participantScheduledMatchUps({
  matchUps = [],
  scheduleAttributes = ['scheduledDate', 'scheduledTime'],
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };
  if (!Array.isArray(scheduleAttributes)) return { error: INVALID_VALUES };

  const hasSchedule = ({ schedule }) => {
    const matchUpScheduleKeys = Object.keys(schedule)
      .filter((key) => scheduleAttributes.includes(key))
      .filter((key) => schedule[key]);
    return !!matchUpScheduleKeys.length;
  };

  const scheduledMatchUps = matchUps
    .filter(hasSchedule)
    .reduce((dateMatchUps, matchUp) => {
      const { schedule } = matchUp;
      const date = extractDate(schedule?.scheduledDate);
      const time = extractTime(schedule?.scheduledDate);
      if (date && time) {
        if (dateMatchUps[date]) {
          dateMatchUps[date].push(matchUp);
        } else {
          dateMatchUps[date] = [matchUp];
        }
      }
      return dateMatchUps;
    }, {});

  // sort all date matchUps
  const dates = Object.keys(scheduledMatchUps);
  dates.forEach((date) => {
    scheduledMatchUps[date].sort((a, b) =>
      timeSort(
        extractTime(a.schedule?.scheduledTime),
        extractTime(b.schedule?.scheduledTime)
      )
    );
  });

  return { scheduledMatchUps };
}
