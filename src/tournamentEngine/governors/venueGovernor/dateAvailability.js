import { validTimePeriod } from '../../../fixtures/validations/time';
import {
  dateValidation,
  timeValidation,
} from '../../../fixtures/validations/regex';

import {
  INVALID_DATE,
  INVALID_TIME,
  INVALID_BOOKINGS,
  INVALID_DATE_AVAILABILITY,
  MISSING_DATE_AVAILABILITY,
} from '../../../constants/errorConditionConstants';

export function validDateAvailability({ dateAvailability }) {
  if (!dateAvailability) return { error: MISSING_DATE_AVAILABILITY };
  if (!Array.isArray(dateAvailability))
    return { error: INVALID_DATE_AVAILABILITY };

  const dateNote = 'Dates must be formated => YYYY-MM-DD';
  const timeNote = 'Times must be 24 hour => 00:00';

  for (const availability of dateAvailability) {
    if (typeof availability !== 'object') {
      return { error: INVALID_DATE_AVAILABILITY };
    }

    const { date, startTime, endTime, bookings = [] } = availability;
    if (!date || !startTime || !endTime) {
      return { error: INVALID_DATE_AVAILABILITY };
    }

    if (!dateValidation.test(date)) {
      return {
        error: INVALID_DATE,
        dateAvailability: { date },
        message: dateNote,
      };
    }
    if (!timeValidation.test(startTime)) {
      return {
        error: INVALID_TIME,
        dateAvailability: { startTime },
        message: timeNote,
      };
    }
    if (!timeValidation.test(endTime)) {
      return {
        error: INVALID_TIME,
        dateAvailability: { endTime },
        message: timeNote,
      };
    }
    if (startTime === endTime) {
      return {
        error: INVALID_TIME,
        dateAvailability: { startTime, endTime },
        message: 'startTime and endTime are equivalent',
      };
    }
    if (!validTimePeriod({ startTime, endTime })) {
      return {
        error: INVALID_TIME,
        dateAvailability: { startTime, endTime },
        message: 'endTime must be after startTime',
      };
    }

    if (bookings) {
      if (!Array.isArray(bookings)) {
        return { error: INVALID_BOOKINGS };
      }

      for (const booking of bookings) {
        if (typeof booking !== 'object') {
          return { error: INVALID_BOOKINGS };
        }
        const { startTime, endTime } = booking;
        if (!timeValidation.test(startTime)) {
          return {
            error: INVALID_TIME,
            booking: { startTime },
            message: timeNote,
          };
        }
        if (!timeValidation.test(endTime)) {
          return {
            error: INVALID_TIME,
            booking: { endTime },
            message: timeNote,
          };
        }
        if (startTime === endTime) {
          return {
            error: INVALID_TIME,
            dateAvailability: { startTime, endTime },
            message: 'startTime and endTime are equivalent',
          };
        }
        if (!validTimePeriod({ startTime, endTime })) {
          return {
            error: INVALID_TIME,
            dateAvailability: { startTime, endTime },
            message: 'endTime must be after startTime',
          };
        }
      }
    }
  }

  return { valid: true };
}
