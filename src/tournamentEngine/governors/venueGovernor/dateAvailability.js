import {
  dateValidation,
  timeValidation,
} from '../../../fixtures/validations/regex';
import { validTimePeriod } from '../../../fixtures/validations/time';

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

  const errors = [];
  const dateNote = 'Dates must be formated => YYYY-MM-DD';
  const timeNote = 'Times must be 24 hour => 00:00';

  dateAvailability
    .filter(f => f)
    .forEach(availability => {
      if (typeof availability !== 'object') {
        errors.push({ error: INVALID_DATE_AVAILABILITY });
        return;
      }

      const { date, startTime, endTime, bookings = [] } = availability;
      if (!date || !startTime || !endTime) {
        errors.push({ error: INVALID_DATE_AVAILABILITY });
        return;
      }

      if (!dateValidation.test(date)) {
        errors.push({
          error: INVALID_DATE,
          dateAvailability: { date },
          message: dateNote,
        });
      }
      if (!timeValidation.test(startTime)) {
        errors.push({
          error: INVALID_TIME,
          dateAvailability: { startTime },
          message: timeNote,
        });
      }
      if (!timeValidation.test(endTime)) {
        errors.push({
          error: INVALID_TIME,
          dateAvailability: { endTime },
          message: timeNote,
        });
      }
      if (startTime === endTime) {
        errors.push({
          error: INVALID_TIME,
          dateAvailability: { startTime, endTime },
          message: 'startTime and endTime are equivalent',
        });
      }
      if (!Array.isArray(bookings)) {
        errors.push({ error: INVALID_BOOKINGS });
      }

      bookings &&
        bookings.forEach(booking => {
          if (typeof booking !== 'object') {
            errors.push({ error: INVALID_DATE_AVAILABILITY });
            return;
          }
          const { startTime, endTime } = booking;
          if (!timeValidation.test(startTime)) {
            errors.push({
              error: INVALID_TIME,
              booking: { startTime },
              message: timeNote,
            });
          }
          if (!timeValidation.test(availability.endTime)) {
            errors.push({
              error: INVALID_TIME,
              booking: { endTime },
              message: timeNote,
            });
          }
          if (startTime === endTime) {
            errors.push({
              error: INVALID_TIME,
              dateAvailability: { startTime, endTime },
              message: 'startTime and endTime are equivalent',
            });
          }
          if (!validTimePeriod({ startTime, endTime })) {
            errors.push({
              error: INVALID_TIME,
              dateAvailability: { startTime, endTime },
              message: 'endTime must be after startTime',
            });
          }
        });
    });

  if (errors.length) return { error: { errors } };

  return { valid: true };
}
