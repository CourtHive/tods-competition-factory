import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { isValidWeekdaysValue } from '@Validators/isValidWeekdaysValue';
import { decorateResult } from '@Functions/global/decorateResult';
import { dateValidation } from '@Validators/regex';
import { extractDate } from '@Tools/dateTime';

// constants and types
import { Event, Tournament, weekdayUnion } from '@Types/tournamentTypes';
import { INVALID, VALIDATE } from '@Constants/attributeConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import {
  INVALID_DATE,
  INVALID_TOURNAMENT_DATES,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '@Constants/errorConditionConstants';

export function setEventStartDate({ tournamentRecord, event, startDate }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (!dateValidation.test(startDate)) return { error: INVALID_DATE };
  const result = getTournamentDates(tournamentRecord);
  if (result.error) return result;
  const { tournamentStartDate, tournamentEndDate } = result;

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const newEventStartDate = new Date(extractDate(startDate)).getTime();
  if (
    !tournamentStartDate ||
    !tournamentEndDate ||
    newEventStartDate < tournamentStartDate ||
    newEventStartDate > tournamentEndDate
  )
    return { error: INVALID_DATE };

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const eventEndDate = event.endDate && new Date(extractDate(event.endDate)).getTime();
  if (eventEndDate && newEventStartDate > eventEndDate) {
    // if the new startDate is after an existing endDate set the endDate to the startDate
    event.endDate = startDate;
  }

  event.startDate = startDate;

  return { ...SUCCESS };
}

export function setEventEndDate(params) {
  const { tournamentRecord, event, endDate } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (!dateValidation.test(endDate)) return { error: INVALID_DATE };
  const result = getTournamentDates(tournamentRecord);
  if (result.error) return result;
  const { tournamentStartDate, tournamentEndDate } = result;

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const newEventEndDate = new Date(extractDate(endDate)).getTime();
  if (
    !tournamentStartDate ||
    !tournamentEndDate ||
    newEventEndDate < tournamentStartDate ||
    newEventEndDate > tournamentEndDate
  )
    return { error: INVALID_DATE };

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const eventStartDate = event.startDate && new Date(extractDate(event.startDate)).getTime();
  if (eventStartDate && newEventEndDate < eventStartDate) {
    // if the new endDate is before an existing startDate set the startDate to the endDate
    event.startDate = endDate;
  }

  event.endDate = endDate;
  return { ...SUCCESS };
}

type SetEventDatesArgs = {
  tournamentRecord: Tournament;
  weekdays?: weekdayUnion[];
  activeDates?: string[];
  startDate?: string;
  endDate?: string;
  event: Event;
};

export function setEventDates(params: SetEventDatesArgs) {
  const paramsCheck = checkRequiredParameters(params, [
    { tournamentRecord: true, event: true },
    {
      [VALIDATE]: (value) => dateValidation.test(value),
      [INVALID]: INVALID_DATE,
      startDate: false,
      endDate: false,
    },
    {
      [VALIDATE]: (value) => value.filter(Boolean).every((d) => dateValidation.test(d)),
      [INVALID]: INVALID_DATE,
      activeDates: false,
    },
    {
      [VALIDATE]: isValidWeekdaysValue,
      weekdays: false,
    },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const { tournamentRecord, weekdays, event, startDate, endDate } = params;
  const activeDates = params.activeDates?.filter(Boolean);

  if (startDate && endDate) {
    const newStartDate = new Date(extractDate(startDate)).getTime();
    const newEndDate = new Date(extractDate(endDate)).getTime();
    if (newStartDate > newEndDate) return { error: INVALID_VALUES };
  }

  if (activeDates) {
    const start = startDate || tournamentRecord.startDate;
    const end = endDate || tournamentRecord.endDate;
    const validStart = !start || activeDates.every((d) => new Date(d) >= new Date(start));
    const validEnd = !end || activeDates.every((d) => new Date(d) <= new Date(end));
    if (!validStart || !validEnd) return { error: INVALID_DATE };
  }

  if (startDate) {
    const result = setEventStartDate({ tournamentRecord, event, startDate });
    if (result.error) return result;
  }

  if (endDate) {
    const result = setEventEndDate({ tournamentRecord, event, endDate });
    if (result.error) return result;
  }

  if (activeDates) event.activeDates = activeDates;
  if (weekdays) event.weekdays = weekdays;

  return { ...SUCCESS };
}

function getTournamentDates(
  tournamentRecord,
): ResultType & { tournamentStartDate?: number; tournamentEndDate?: number } {
  const { startDate, endDate } = tournamentRecord;
  if (!dateValidation.test(startDate) || !dateValidation.test(endDate)) {
    return decorateResult({
      result: { error: INVALID_TOURNAMENT_DATES },
      context: { startDate, endDate },
    });
  }

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  return {
    tournamentStartDate: new Date(extractDate(startDate)).getTime(),
    tournamentEndDate: new Date(extractDate(endDate)).getTime(),
  };
}
