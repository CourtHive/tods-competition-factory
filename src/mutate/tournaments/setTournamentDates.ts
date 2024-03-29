import { clearScheduledMatchUps } from '@Mutate/matchUps/schedule/clearScheduledMatchUps';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { updateCourtAvailability } from '@Mutate/venues/updateCourtAvailability';
import { isValidWeekdaysValue } from '@Validators/isValidWeekdaysValue';
import { definedAttributes } from '@Tools/definedAttributes';
import { addNotice } from '@Global/state/globalState';
import { generateDateRange } from '@Tools/dateTime';
import { dateValidation } from '@Validators/regex';

// constants and types
import { INVALID_DATE, INVALID_VALUES, SCHEDULE_NOT_CLEARED } from '@Constants/errorConditionConstants';
import { MODIFY_TOURNAMENT_DETAIL } from '@Constants/topicConstants';
import { INVALID, VALIDATE } from '@Constants/attributeConstants';
import { Tournament, weekdayUnion } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';

type SetTournamentDatesArgs = {
  tournamentRecord: Tournament;
  weekdays?: weekdayUnion[];
  activeDates?: string[];
  startDate?: string;
  endDate?: string;
};
export function setTournamentDates(params: SetTournamentDatesArgs): ResultType & {
  unscheduledMatchUpIds?: string[];
  datesRemoved?: string[];
  datesAdded?: string[];
} {
  const { tournamentRecord, startDate, endDate, activeDates, weekdays } = params;

  const paramsCheck = checkRequiredParameters(params, [
    { tournamentRecord: true },
    {
      [VALIDATE]: (value) => dateValidation.test(value),
      [INVALID]: INVALID_DATE,
      startDate: false,
      endDate: false,
    },
    {
      [VALIDATE]: (value) => value.every((d) => dateValidation.test(d)),
      [INVALID]: INVALID_DATE,
      activeDates: false,
    },
    {
      [VALIDATE]: isValidWeekdaysValue,
      weekdays: false,
    },
  ]);
  if (paramsCheck.error) return paramsCheck;

  if (endDate && startDate && new Date(endDate) < new Date(startDate)) return { error: INVALID_VALUES };
  if (endDate && startDate && new Date(startDate) > new Date(endDate)) return { error: INVALID_VALUES };

  if (activeDates) {
    const start = startDate || tournamentRecord.startDate;
    const end = endDate || tournamentRecord.endDate;
    const validStart = !start || activeDates.every((d) => new Date(d) >= new Date(start));
    const validEnd = !end || activeDates.every((d) => new Date(d) <= new Date(end));
    if (!validStart || !validEnd) return { error: INVALID_DATE };
  }

  let checkScheduling;
  // if start has moved closer to end or end has moved closer to start, check for scheduling issues
  if (
    (startDate && tournamentRecord.startDate && new Date(startDate) > new Date(tournamentRecord.startDate)) ||
    (endDate && tournamentRecord.endDate && new Date(endDate) < new Date(tournamentRecord.endDate))
  ) {
    checkScheduling = true;
  }

  const initialDateRange = generateDateRange(tournamentRecord.startDate, tournamentRecord.endDate);
  if (startDate) tournamentRecord.startDate = startDate;
  if (endDate) tournamentRecord.endDate = endDate;
  const resultingDateRange = generateDateRange(tournamentRecord.startDate, tournamentRecord.endDate);
  const datesRemoved = initialDateRange.filter((date) => !resultingDateRange.includes(date));
  const datesAdded = resultingDateRange.filter((date) => !initialDateRange.includes(date));

  for (const event of tournamentRecord.events ?? []) {
    // if event startDate is earlier than tournament startDate, coerce event startDate to tournament startDate
    if (startDate && event.startDate && new Date(event.startDate) < new Date(startDate)) event.startDate = startDate;
    // if event startDate is later than tournament endDate, coerce event startDate to tournament startDate or endDate
    if (endDate && event.startDate && new Date(event.startDate) > new Date(endDate))
      event.startDate = startDate ?? endDate;
    // if event endDate is greater than tournament endDate, coerce event endDate to tournament endDate
    if (endDate && event.endDate && new Date(event.endDate) > new Date(endDate)) event.endDate = endDate;
    // if tournament startDate is greater than event endDate, coerce event endDate to tournament endDate or startDate
    if (startDate && event.endDate && new Date(event.endDate) < new Date(startDate))
      event.endDate = endDate ?? startDate;
  }

  // if there is a startDate specified after current endDate, endDate must be set to startDate
  if (startDate && tournamentRecord.endDate && new Date(startDate) > new Date(tournamentRecord.endDate)) {
    tournamentRecord.endDate = startDate;
  }

  // if there is a endDate specified before current startDate, startDate must be set to endDate
  if (endDate && tournamentRecord.startDate && new Date(endDate) < new Date(tournamentRecord.startDate)) {
    tournamentRecord.startDate = endDate;
  }

  if (activeDates) tournamentRecord.activeDates = activeDates;
  if (weekdays) tournamentRecord.weekdays = weekdays;

  const unscheduledMatchUpIds = checkScheduling && removeInvalidScheduling({ tournamentRecord })?.unscheduledMatchUpIds;

  updateCourtAvailability({ tournamentRecord });
  addNotice({
    payload: definedAttributes({
      parentOrganisation: tournamentRecord.parentOrganisation,
      tournamentId: tournamentRecord.tournamentId,
      activeDates,
      startDate,
      weekdays,
      endDate,
    }),
    topic: MODIFY_TOURNAMENT_DETAIL,
  });

  return { ...SUCCESS, unscheduledMatchUpIds, datesAdded, datesRemoved };
}

export function setTournamentStartDate({ tournamentRecord, startDate }) {
  return setTournamentDates({ tournamentRecord, startDate });
}

export function setTournamentEndDate({ tournamentRecord, endDate }) {
  return setTournamentDates({ tournamentRecord, endDate });
}

// unschedule scheduled matchUps that fall outside of tournament dates
export function removeInvalidScheduling({ tournamentRecord }) {
  const matchUps = allTournamentMatchUps({ tournamentRecord }).matchUps ?? [];

  const startDate = tournamentRecord.startDate && new Date(tournamentRecord.startDate);
  const endDate = tournamentRecord.endDate && new Date(tournamentRecord.endDate);

  const invalidScheduledDates: string[] = [];
  const invalidSchedulingMatchUpIds: string[] = [];
  for (const matchUp of matchUps) {
    const { schedule, matchUpId } = matchUp;
    if (!schedule) continue;
    if (schedule.scheduledDate) {
      const scheduledDate = new Date(schedule.scheduledDate);
      if ((startDate && scheduledDate < startDate) || (endDate && scheduledDate > endDate)) {
        invalidSchedulingMatchUpIds.push(matchUpId);
        if (!invalidScheduledDates.includes(schedule.scheduledDate)) invalidScheduledDates.push(schedule.scheduledDate);
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
