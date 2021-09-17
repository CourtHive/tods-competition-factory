import { hasSchedule } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/hasSchedule';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { getTournamentInfo } from '../publishingGovernor/getTournamentInfo';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getDrawDefinition } from '../../getters/eventGetter';
import {
  addMinutesToTimeString,
  dateStringDaysChange,
  extractDate,
  extractTime,
  timeStringMinutes,
} from '../../../utilities/dateTime';
import {
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
} from './scheduleItems';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string[]} matchUpIds - array of matchUpIds to be scheduled
 * @param {object} scheduleChange - { minutesChange, daysChange }
 *
 */
export function bulkRescheduleMatchUps({
  tournamentRecord,
  scheduleChange,
  matchUpIds,
  dryRun,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };
  if (typeof scheduleChange !== 'object') return { error: INVALID_VALUES };

  const rescheduled = [];
  const notRescheduled = [];
  const { minutesChange, daysChange } = scheduleChange;
  if (!minutesChange && !daysChange) return { ...SUCCESS };

  if (minutesChange && isNaN(minutesChange)) return { error: INVALID_VALUES };
  if (daysChange && isNaN(daysChange)) return { error: INVALID_VALUES };

  const { matchUps } = allTournamentMatchUps({
    tournamentRecord,
    matchUpFilters: { matchUpIds },
  });

  const notCompleted = ({ matchUpStatus }) =>
    !completedMatchUpStatuses.includes(matchUpStatus);

  // return success if there are no scheduled matchUps to reschedule
  const scheduledNotCompletedMatchUps = matchUps
    ?.filter(hasSchedule)
    .filter(notCompleted);
  if (!scheduledNotCompletedMatchUps.length) return { ...SUCCESS };

  const { tournamentInfo } = getTournamentInfo({ tournamentRecord });
  const { startDate, endDate } = tournamentInfo;

  // first organize matchUpIds by drawId
  const drawIdMap = scheduledNotCompletedMatchUps.reduce(
    (drawIdMap, matchUp) => {
      const { matchUpId, drawId } = matchUp;
      if (drawIdMap[drawId]) {
        drawIdMap[drawId].push(matchUpId);
      } else {
        drawIdMap[drawId] = [matchUpId];
      }
      return drawIdMap;
    },
    {}
  );

  const dayTotalMinutes = 1440;
  for (const drawId of Object.keys(drawIdMap)) {
    const { drawDefinition, error } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });
    if (error) return { error };
    const drawMatchUpIds = drawIdMap[drawId].filter((matchUpId) =>
      matchUpIds.includes(matchUpId)
    );

    for (const matchUpId of drawMatchUpIds) {
      if (matchUpId && drawDefinition) {
        const inContextMatchUp = scheduledNotCompletedMatchUps.find(
          (matchUp) => matchUp.matchUpId === matchUpId
        );
        const schedule = inContextMatchUp.schedule;
        const { scheduledTime, scheduledDate, averageMinutes } = schedule;

        let doNotReschedule, newScheduledTime, newScheduledDate;
        if (minutesChange && scheduledTime) {
          const scheduledTimeDate = extractDate(scheduledTime);
          const currentDayMinutes = timeStringMinutes(
            extractTime(scheduledTime)
          );
          const newTime = currentDayMinutes + minutesChange + averageMinutes;
          doNotReschedule = newTime < 0 || newTime > dayTotalMinutes;

          if (!doNotReschedule) {
            let timeString = addMinutesToTimeString(
              scheduledTime,
              minutesChange
            );
            newScheduledTime = scheduledTimeDate
              ? `${scheduledTimeDate}T${timeString}`
              : timeString;
          }
        }

        if (!doNotReschedule && daysChange && scheduledDate) {
          const currentDate = extractDate(scheduledDate);
          newScheduledDate = dateStringDaysChange(currentDate, daysChange);

          doNotReschedule =
            new Date(newScheduledDate) < new Date(startDate) ||
            new Date(newScheduledDate) > new Date(endDate);
        }

        if (doNotReschedule) {
          notRescheduled.push(inContextMatchUp);
        } else {
          if (!dryRun) {
            if (newScheduledTime) {
              const result = addMatchUpScheduledTime({
                drawDefinition,
                matchUpId,
                scheduledTime: newScheduledTime,
              });
              if (result.error) return result;
            }
            if (newScheduledDate) {
              const result = addMatchUpScheduledDate({
                drawDefinition,
                matchUpId,
                scheduledDate: newScheduledDate,
              });
              if (result.error) return result;
            }
          }
          if (newScheduledTime || newScheduledDate)
            rescheduled.push(inContextMatchUp);
        }
      }
    }
  }

  const allRescheduled = rescheduled.length && !notRescheduled.length;

  return { ...SUCCESS, rescheduled, notRescheduled, allRescheduled };
}
