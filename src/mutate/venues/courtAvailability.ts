import { getAppliedPolicies } from '../../query/extensions/getAppliedPolicies';
import { getScheduledCourtMatchUps } from '../../query/venues/getScheduledCourtMatchUps';
import { minutesDifference, timeToDate } from '../../tools/dateTime';
import { startTimeSort } from '../../validators/time';
import { addNotice } from '../../global/state/globalState';
import { validDateAvailability } from '../../validators/validateDateAvailability';
import { findCourt } from './findCourt';

import { Availability, Tournament } from '../../types/tournamentTypes';
import { POLICY_TYPE_SCHEDULING } from '@Constants/policyConstants';
import { MODIFY_VENUE } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '../../types/hydrated';
import { ErrorType, MISSING_COURT_ID, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

type ModifyCourtAvailabilityArgs = {
  venueMatchUps?: HydratedMatchUp[];
  dateAvailability: Availability[];
  tournamentRecord: Tournament;
  disableNotice?: boolean;
  courtId: string;
  force?: boolean;
};
export function modifyCourtAvailability({
  tournamentRecord,
  dateAvailability,
  disableNotice,
  venueMatchUps,
  courtId,
  force,
}: ModifyCourtAvailabilityArgs): {
  error?: ErrorType;
  success?: boolean;
  totalMergeCount?: number;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const dateResult = validDateAvailability({ dateAvailability });
  if (dateResult.error) return dateResult;

  // TODO: build up a map of affected dates and:
  // 1. whether aggregate time on given dates has increased or decreased
  // 2. specific periods of time on given dates that are no longer available

  const { updatedDateAvailability, totalMergeCount } = sortAndMergeDateAvailability(dateAvailability);
  dateAvailability = updatedDateAvailability;

  const courtResult = findCourt({ tournamentRecord, courtId });
  if (courtResult.error) return courtResult;
  const { court, venue } = courtResult;

  const { matchUps: courtMatchUps } = getScheduledCourtMatchUps({
    tournamentRecord,
    venueMatchUps,
    courtId,
  });

  // TODO: check whether there are matchUps which are no longer possible to play
  // In the first instance, matchUps which are explicitly scheduled on the court for times which are no longer available
  // NOTE: see dateAvailability.test.ts
  if (courtMatchUps?.length) {
    const appliedPolicies = getAppliedPolicies({
      tournamentRecord,
    })?.appliedPolicies;

    const allowModificationWhenMatchUpsScheduled =
      force ?? appliedPolicies?.[POLICY_TYPE_SCHEDULING]?.allowDeletionWithScoresPresent?.courts;

    // Iterate through courtMatchUps and check that scheduledTime/scheduledDate still avilable
    const matchUpsWithInvalidScheduling = [];

    if (matchUpsWithInvalidScheduling.length) {
      if (allowModificationWhenMatchUpsScheduled) {
        // go ahead and remove scheduling
      } else {
        console.log('throw error: scheduled court matchUps', matchUpsWithInvalidScheduling.length);
      }
    }
  }
  // TODO: In the second instance, if there is reduced aggregate court time matchUps scheduled on the affected dates (but not specific court)
  // would have scheduling impacts impacts

  if (court) {
    court.dateAvailability = dateAvailability;

    if (!disableNotice && venue)
      addNotice({
        payload: { venue, tournamentId: tournamentRecord.tournamentId },
        topic: MODIFY_VENUE,
        key: venue.venueId,
      });
  }

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

  const updatedDateAvailability: any[] = [];

  Object.keys(availabilityByDate).forEach((date) => {
    availabilityByDate[date].sort(startTimeSort);
    const { mergedAvailability, mergeCount } = getMergedAvailability(availabilityByDate[date]);
    updatedDateAvailability.push(
      ...mergedAvailability.map((availability: any) => ({
        date,
        ...availability,
      })),
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
  const mergedAvailability: any[] = [];

  while (dateDetails.length && safety) {
    const details = dateDetails.shift();
    const { startTime, endTime, bookings } = details;
    safety -= 1;

    if (!lastStartTime) {
      lastStartTime = startTime;
      lastBookings = bookings;
      lastEndTime = endTime;
    } else {
      const difference = minutesDifference(timeToDate(lastEndTime), timeToDate(startTime), false);

      if (difference > 0) {
        const availability: any = {
          startTime: lastStartTime,
          endTime: lastEndTime,
        };
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
  const availability: any = { startTime: lastStartTime, endTime: lastEndTime };
  if (lastBookings?.length) availability.bookings = lastBookings;
  mergedAvailability.push(availability);

  return { mergedAvailability, mergeCount };
}
