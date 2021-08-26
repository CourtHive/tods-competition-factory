import { dateValidation } from '../../../fixtures/validations/regex';
import { extractDate } from '../../../utilities/dateTime';

import {
  INVALID_DATE,
  INVALID_TOURNAMENT_DATES,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setEventStartDate({ tournamentRecord, event, startDate }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (!dateValidation.test(startDate)) return { error: INVALID_DATE };
  const { tournamentStartDate, tournamentEndDate, error } =
    getTournamentDates(tournamentRecord);
  if (error) return { error };

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const newEventStartDate = new Date(extractDate(startDate));
  if (
    newEventStartDate < tournamentStartDate ||
    newEventStartDate > tournamentEndDate
  )
    return { error: INVALID_DATE };

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const eventEndDate = event.endDate && new Date(extractDate(event.endDate));
  if (eventEndDate && newEventStartDate > eventEndDate) {
    // if the new startDate is after an existing endDate set the endDate to the startDate
    event.endDate = startDate;
  }

  event.startDate = startDate;

  return SUCCESS;
}

export function setEventEndDate({ tournamentRecord, event, endDate }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (!dateValidation.test(endDate)) return { error: INVALID_DATE };
  const { tournamentStartDate, tournamentEndDate, error } =
    getTournamentDates(tournamentRecord);
  if (error) return { error };

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const newEventEndDate = new Date(extractDate(endDate));
  if (
    newEventEndDate < tournamentStartDate ||
    newEventEndDate > tournamentEndDate
  )
    return { error: INVALID_DATE };

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  const eventStartDate =
    event.startDate && new Date(extractDate(event.startDate));
  if (eventStartDate && newEventEndDate < eventStartDate) {
    // if the new endDate is before an existing startDate set the startDate to the endDate
    event.startDate = endDate;
  }

  event.endDate = endDate;
  return SUCCESS;
}

export function setEventDates({ tournamentRecord, event, startDate, endDate }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (!startDate && !endDate) return { error: MISSING_VALUE };
  if (startDate && !dateValidation.test(startDate))
    return { error: INVALID_DATE };
  if (endDate && !dateValidation.test(endDate)) return { error: INVALID_DATE };

  if (startDate && endDate) {
    const newStartDate = new Date(extractDate(startDate));
    const newEndDate = new Date(extractDate(endDate));
    if (newStartDate > newEndDate) return { error: INVALID_VALUES };
  }

  if (startDate) {
    const { error } = setEventStartDate({ tournamentRecord, event, startDate });
    if (error) return { error };
  }

  if (endDate) {
    const { error } = setEventEndDate({ tournamentRecord, event, endDate });
    if (error) return { error };
  }

  return SUCCESS;
}

function getTournamentDates(tournamentRecord) {
  const { startDate, endDate } = tournamentRecord;
  if (!dateValidation.test(startDate) || !dateValidation.test(endDate)) {
    return { error: INVALID_TOURNAMENT_DATES };
  }

  // use extractDate() to ensure that only the YYYY-MM-DD part of date is used for comparison
  return {
    tournamentStartDate: new Date(extractDate(startDate)),
    tournamentEndDate: new Date(extractDate(endDate)),
  };
}
