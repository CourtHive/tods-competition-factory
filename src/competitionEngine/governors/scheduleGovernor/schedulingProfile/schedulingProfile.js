import { validateSchedulingProfile } from '../../../../global/validation/validateSchedulingProfile';
import { getCompetitionDateRange } from '../../queryGovernor/getCompetitionDateRange';
import { getEventIdsAndDrawIds } from '../../../getters/getEventIdsAndDrawIds';
import { getCompetitionVenues } from '../../../getters/venuesAndCourtsGetter';
import {
  extractDate,
  isValidDateString,
  sameDay,
} from '../../../../utilities/dateTime';
import {
  addExtension,
  findExtension,
  removeExtension,
} from '../../competitionsGovernor/competitionExtentions';

import { SCHEDULING_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  EXISTING_ROUND,
  INVALID_DATE,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

export function getSchedulingProfile({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const { extension } = findExtension({
    name: SCHEDULING_PROFILE,
    tournamentRecords,
  });

  let schedulingProfile = extension?.value || [];

  if (schedulingProfile.length) {
    const { venueIds } = getCompetitionVenues({
      tournamentRecords,
      requireCourts: true,
    });
    const { eventIds, drawIds } = getEventIdsAndDrawIds({ tournamentRecords });

    const { updatedSchedulingProfile, modifications, issues } =
      getUpdatedSchedulingProfile({
        schedulingProfile,
        venueIds,
        eventIds,
        drawIds,
      });

    if (modifications) {
      schedulingProfile = updatedSchedulingProfile;
      const result = setSchedulingProfile({
        tournamentRecords,
        schedulingProfile,
      });
      if (result.error) return result;

      return { schedulingProfile, modifications, issues };
    }
  }

  return { schedulingProfile, modifications: 0 };
}

export function setSchedulingProfile({ tournamentRecords, schedulingProfile }) {
  const profileValidity = validateSchedulingProfile({
    tournamentRecords,
    schedulingProfile,
  });

  if (profileValidity.error) return profileValidity;

  if (!schedulingProfile)
    return removeExtension({ tournamentRecords, name: SCHEDULING_PROFILE });

  const extension = {
    name: SCHEDULING_PROFILE,
    value: schedulingProfile,
  };

  return addExtension({ tournamentRecords, extension });
}

export function addSchedulingProfileRound({
  tournamentRecords,
  scheduleDate,
  venueId,
  round,
}) {
  if (!isValidDateString(scheduleDate)) return { error: INVALID_DATE };

  const { extension } = findExtension({
    tournamentRecords,
    name: SCHEDULING_PROFILE,
  });

  const schedulingProfile = extension?.value || [];
  let dateProfile = schedulingProfile.find((dateProfile) =>
    sameDay(scheduleDate, dateProfile.scheduleDate)
  );

  if (!dateProfile) {
    const { startDate, endDate } = getCompetitionDateRange({
      tournamentRecords,
    });
    const dateObject = new Date(scheduleDate);
    if (dateObject < new Date(startDate) || dateObject > new Date(endDate))
      return { error: INVALID_DATE };

    dateProfile = { scheduleDate, venues: [] };
    schedulingProfile.push(dateProfile);
  }

  let venueOnDate = dateProfile.venues.find(
    (venue) => venue.venueId === venueId
  );

  if (!venueOnDate) {
    venueOnDate = { venueId, rounds: [] };
    dateProfile.venues.push(venueOnDate);
  }

  // ensure round is not already present
  const excludeKeys = ['notBeforeTime'];
  const hashRound = (r) =>
    Object.keys(r)
      .filter((key) => !excludeKeys.includes(key))
      .sort()
      .map((k) => r[k])
      .join('|');

  const roundExists = venueOnDate.rounds.find(
    (existingRound) => hashRound(existingRound) === hashRound(round)
  );
  if (roundExists) return { error: EXISTING_ROUND };
  venueOnDate.rounds.push(round);

  const result = setSchedulingProfile({ tournamentRecords, schedulingProfile });
  if (result.error) return result;

  return { ...SUCCESS };
}

export function getUpdatedSchedulingProfile({
  schedulingProfile,
  venueIds,
  eventIds,
  drawIds,
}) {
  const issues = [];
  const updatedSchedulingProfile = schedulingProfile
    ?.map((dateSchedulingProfile) => {
      const date = extractDate(dateSchedulingProfile?.scheduleDate);
      if (!date) {
        issues.push(`Invalid date: ${dateSchedulingProfile?.scheduledDate}`);
        return;
      }

      const venues = (dateSchedulingProfile?.venues || [])
        .map((venue) => {
          const { rounds, venueId } = venue;
          const venueExists = venueIds.includes(venueId);
          if (!venueExists) {
            issues.push(`Missing venueId: ${venueId}`);
            return;
          }

          const filteredRounds = rounds.filter((round) => {
            const validEventIdAndDrawId =
              eventIds.includes(round.eventId) &&
              drawIds.includes(round.drawId);
            if (!validEventIdAndDrawId)
              issues.push(
                `Invalid eventId: ${round.eventId} or drawId: ${round.drawId}`
              );
            return validEventIdAndDrawId;
          });

          if (!filteredRounds.length) return;

          return { venueId, rounds: filteredRounds };
        })
        .filter(Boolean);

      return venues.length && date && { ...dateSchedulingProfile, venues };
    })
    .filter(Boolean);

  const modifications = issues.length;
  return { updatedSchedulingProfile, modifications, issues };
}

export function checkSchedulingProfile({ tournamentRecords }) {
  const { schedulingProfile } = getSchedulingProfile({
    tournamentRecords,
    requireCourts: true,
  });
  if (schedulingProfile) {
    const { venueIds } = getCompetitionVenues({ tournamentRecords });
    const { eventIds, drawIds } = getEventIdsAndDrawIds({ tournamentRecords });
    const { updatedSchedulingProfile, modifications } =
      getUpdatedSchedulingProfile({
        schedulingProfile,
        venueIds,
        eventIds,
        drawIds,
      });

    if (modifications) {
      return setSchedulingProfile({
        tournamentRecords,
        schedulingProfile: updatedSchedulingProfile,
      });
    }
  }

  return { ...SUCCESS };
}
