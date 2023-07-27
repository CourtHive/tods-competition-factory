import { clearScheduledMatchUps } from '../scheduleGovernor/clearScheduledMatchUps';
import { updateCourtAvailability } from '../venueGovernor/updateCourtAvailability';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { dateValidation } from '../../../fixtures/validations/regex';
import { addNotice } from '../../../global/state/globalState';

import { MODIFY_TOURNAMENT_DETAIL } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DATE,
  INVALID_VALUES,
  MISSING_DATE,
  MISSING_TOURNAMENT_RECORD,
  SCHEDULE_NOT_CLEARED,
} from '../../../constants/errorConditionConstants';

export function setTournamentDates({ tournamentRecord, startDate, endDate }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  if (
    (startDate && !dateValidation.test(startDate)) ||
    (endDate && !dateValidation.test(endDate))
  )
    return { error: INVALID_DATE };

  if (!startDate && !endDate) return { error: MISSING_DATE };

  if (endDate && startDate && new Date(endDate) < new Date(startDate))
    return { error: INVALID_VALUES };

  let checkScheduling;
  // if start has moved closer to end or end has moved closer to start, check for scheduling issues
  if (
    (startDate &&
      tournamentRecord.startDate &&
      new Date(startDate) > new Date(tournamentRecord.startDate)) ||
    (endDate &&
      tournamentRecord.endDate &&
      new Date(endDate) < new Date(tournamentRecord.endDate))
  ) {
    checkScheduling = true;
  }

  if (startDate) tournamentRecord.startDate = startDate;
  if (endDate) tournamentRecord.endDate = endDate;

  // if there is a startDate specified after current endDate, endDate must be set to startDate
  if (
    startDate &&
    tournamentRecord.endDate &&
    new Date(startDate) > new Date(tournamentRecord.endDate)
  ) {
    tournamentRecord.endDate = startDate;
  }

  // if there is a endDate specified before current startDate, startDate must be set to endDate
  if (
    endDate &&
    tournamentRecord.startDate &&
    new Date(endDate) < new Date(tournamentRecord.startDate)
  ) {
    tournamentRecord.startDate = endDate;
  }

  const unscheduledMatchUpIds =
    checkScheduling &&
    removeInvalidScheduling({ tournamentRecord })?.unscheduledMatchUpIds;

  updateCourtAvailability({ tournamentRecord });

  addNotice({
    topic: MODIFY_TOURNAMENT_DETAIL,
    payload: { startDate, endDate },
  });

  return { ...SUCCESS, unscheduledMatchUpIds };
}

// TODO: check all courts in all venues for dateAvailability that is outside of tournament date range
export function setTournamentStartDate({ tournamentRecord, startDate }) {
  return setTournamentDates({ tournamentRecord, startDate });
}

// TODO: check all courts in all venues for dateAvailability that is outside of tournament date range
export function setTournamentEndDate({ tournamentRecord, endDate }) {
  return setTournamentDates({ tournamentRecord, endDate });
}

// unschedule scheduled matchUps that fall outside of tournament dates
export function removeInvalidScheduling({ tournamentRecord }) {
  const { matchUps } = allTournamentMatchUps({ tournamentRecord });

  const startDate =
    tournamentRecord.startDate && new Date(tournamentRecord.startDate);
  const endDate =
    tournamentRecord.endDate && new Date(tournamentRecord.endDate);

  const invalidScheduledDates = [];
  const invalidSchedulingMatchUpIds = [];
  for (const matchUp of matchUps) {
    const { schedule, matchUpId } = matchUp;
    if (!schedule) continue;
    if (schedule.scheduledDate) {
      const scheduledDate = new Date(schedule.scheduledDate);
      if (
        (startDate && scheduledDate < startDate) ||
        (endDate && scheduledDate > endDate)
      ) {
        invalidSchedulingMatchUpIds.push(matchUpId);
        if (!invalidScheduledDates.includes(schedule.scheduledDate))
          invalidScheduledDates.push(schedule.scheduledDate);
      }
    }
  }

  if (invalidScheduledDates.length) {
    const result = clearScheduledMatchUps({
      scheduledDates: invalidScheduledDates,
      tournamentRecord,
    });
    if (!result.clearedScheduleCount) return { error: SCHEDULE_NOT_CLEARED };
  }

  return { unscheduledMatchUpIds: invalidSchedulingMatchUpIds };
}
