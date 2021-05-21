import { getCompetitionVenues } from '../../getters/venuesAndCourtsGetter';
import { isValidDateString, sameDay } from '../../../utilities/dateTime';
import {
  addExtension,
  findExtension,
} from '../competitionsGovernor/competitionExtentions';

import {
  INVALID_DATE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { SCHEDULING_PROFILE } from '../../../constants/extensionConstants';
import { validSchedulingProfile } from '../../../global/validation/validSchedulingProfile';

export function getSchedulingProfile({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const { extension } = findExtension({
    tournamentRecords,
    name: SCHEDULING_PROFILE,
  });
  return { schedulingProfile: extension?.value || [] };
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

  venueOnDate.rounds.push(round);

  return setSchedulingProfile({ tournamentRecords, schedulingProfile });
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
