import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import { minutesDifference, timeToDate } from '../../../utilities/dateTime';
import { startTimeSort } from '../../../fixtures/validations/time';
import { addNotice } from '../../../global/state/globalState';
import { validDateAvailability } from './dateAvailability';
import { findCourt } from '../../getters/courtGetter';

import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function modifyCourtAvailability({
  tournamentRecord,
  dateAvailability,
  disableNotice,
  venueMatchUps,
  courtId,
  force,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const result = validDateAvailability({ dateAvailability });
  if (result.error) return result;

  const { updatedDateAvailability, totalMergeCount } =
    sortAndMergeDateAvailability(dateAvailability);
  dateAvailability = updatedDateAvailability;

  const { court, venue, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  const { matchUps: courtMatchUps } = getScheduledCourtMatchUps({
    tournamentRecord,
    venueMatchUps,
    courtId,
  });

  // TODO: check whether there are matchUps which are no longer possible to play
  // this will only apply to Pro Scheduling
  if (courtMatchUps?.length) {
    console.log('scheduled court matchUps', courtMatchUps.length);
    if (force) {
      // go ahead and remove scheduling
    }
  }

  court.dateAvailability = dateAvailability;

  if (!disableNotice)
    addNotice({
      payload: { venue, tournamentId: tournamentRecord.tournamentId },
      topic: MODIFY_VENUE,
      key: venue.venueId,
    });

  return { ...SUCCESS, totalMergeCount };
}

function sortAndMergeDateAvailability(dateAvailability) {
  let totalMergeCount = 0;

  const availabilityByDate = dateAvailability.reduce((byDate, availability) => {
    const { date, startTime, endTime, bookings } = availability;
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({ startTime, endTime, bookings });
    return byDate;
  }, {});

  const updatedDateAvailability = [];

  Object.keys(availabilityByDate).forEach((date) => {
    availabilityByDate[date].sort(startTimeSort);
    const { mergedAvailability, mergeCount } = getMergedAvailability(
      availabilityByDate[date]
    );
    updatedDateAvailability.push(
      ...mergedAvailability.map((availability) => ({ date, ...availability }))
    );
    totalMergeCount += mergeCount;
  });

  return { updatedDateAvailability, totalMergeCount };
}

function getMergedAvailability(dateDetails) {
  let lastStartTime,
    lastEndTime,
    lastBookings,
    safety = dateDetails.length,
    mergeCount = 0;
  const mergedAvailability = [];

  while (dateDetails.length && safety) {
    const details = dateDetails.shift();
    const { startTime, endTime, bookings } = details;
    safety -= 1;

    if (!lastStartTime) {
      lastStartTime = startTime;
      lastBookings = bookings;
      lastEndTime = endTime;
    } else {
      const difference = minutesDifference(
        timeToDate(lastEndTime),
        timeToDate(startTime),
        false
      );

      if (difference > 0) {
        const availability = { startTime: lastStartTime, endTime: lastEndTime };
        if (lastBookings?.length) availability.bookings = lastBookings;
        mergedAvailability.push(availability);
        lastStartTime = startTime;
        lastBookings = bookings;
        lastEndTime = endTime;
      } else {
        if (bookings) {
          if (lastBookings) {
            lastBookings.push(bookings);
          } else {
            lastBookings = bookings;
          }
        }
        lastEndTime = endTime;
        mergeCount += 1;
      }
    }
  }
  const availability = { startTime: lastStartTime, endTime: lastEndTime };
  if (lastBookings?.length) availability.bookings = lastBookings;
  mergedAvailability.push(availability);

  return { mergedAvailability, mergeCount };
}
