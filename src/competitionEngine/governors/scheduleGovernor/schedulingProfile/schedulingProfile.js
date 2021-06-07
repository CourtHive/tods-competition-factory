import { validSchedulingProfile } from '../../../../global/validation/validSchedulingProfile';
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
} from '../../competitionsGovernor/competitionExtentions';

import {
  INVALID_DATE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';
import { SCHEDULING_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function getSchedulingProfile({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const { extension } = findExtension({
    tournamentRecords,
    name: SCHEDULING_PROFILE,
  });

  let schedulingProfile = extension?.value || [];

  if (schedulingProfile.length) {
    const { venueIds } = getCompetitionVenues({ tournamentRecords });
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
      setSchedulingProfile({
        tournamentRecords,
        schedulingProfile,
      });
      return { schedulingProfile, modifications, issues };
    }
  }

  return { schedulingProfile };
}

export function setSchedulingProfile({ tournamentRecords, schedulingProfile }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!isValidSchedulingProfile({ tournamentRecords, schedulingProfile }))
    return { error: INVALID_VALUES };

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
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!isValidDateString(scheduleDate)) return { error: INVALID_DATE };
  if (!isValidSchedulingRound(round)) return { error: INVALID_VALUES };

  // TODO: check that scheduleDate falls within date range of tournaments

  const { extension } = findExtension({
    tournamentRecords,
    name: SCHEDULING_PROFILE,
  });

  const schedulingProfile = extension?.value || [];
  let dateProfile = schedulingProfile.find((dateProfile) =>
    sameDay(scheduleDate, dateProfile.scheduleDate)
  );

  if (!dateProfile) {
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

  // TODO: check that round.eventId, round.drawId, round.structureId and round.roundNumber all exist
  // if not, throw error...
  venueOnDate.rounds.push(round);

  const result = setSchedulingProfile({ tournamentRecords, schedulingProfile });
  if (result.error) return result;

  return SUCCESS;
}

export function isValidSchedulingProfile({
  tournamentRecords,
  schedulingProfile,
}) {
  const { venueIds } = getCompetitionVenues({ tournamentRecords });
  return validSchedulingProfile({ venueIds, schedulingProfile });
}

export function isValidSchedulingRound(/*{tournamentRecords, round}*/) {
  return true;
}

export function getUpdatedSchedulingProfile({
  schedulingProfile,
  venueIds,
  eventIds,
  drawIds,
}) {
  let issues = [];
  const updatedSchedulingProfile = schedulingProfile
    .map((dateSchedulingProfile) => {
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
          if (!filteredRounds.length) {
            return;
          }

          return { venueId, rounds: filteredRounds };
        })
        .filter((f) => f);

      return venues.length && date && { ...dateSchedulingProfile, venues };
    })
    .filter((f) => f);

  return { updatedSchedulingProfile, modifications: issues.length, issues };
}
