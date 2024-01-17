import { getCompetitionDateRange } from '../../../query/tournaments/getCompetitionDateRange';
import { decorateResult } from '../../../global/functions/decorateResult';
import { isValidDateString, sameDay } from '../../../tools/dateTime';
import { findExtension } from '../../../acquire/findExtension';
import { setSchedulingProfile } from '../../tournaments/schedulingProfile';
import { isObject } from '../../../tools/objects';

import { SCHEDULING_PROFILE } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { EXISTING_ROUND, INVALID_DATE } from '../../../constants/errorConditionConstants';

export function addSchedulingProfileRound({ tournamentRecords, scheduleDate, venueId, round }) {
  if (!isValidDateString(scheduleDate)) {
    return { error: INVALID_DATE };
  }
  const stack = 'addSchedulingProfileRound';

  const { extension } = findExtension({
    name: SCHEDULING_PROFILE,
    tournamentRecords,
    discover: true,
  });

  const schedulingProfile = extension?.value || [];
  let dateProfile = schedulingProfile.find((dateProfile) => sameDay(scheduleDate, dateProfile.scheduleDate));

  if (!dateProfile) {
    const { startDate, endDate } = getCompetitionDateRange({
      tournamentRecords,
    });
    const dateObject = new Date(scheduleDate);
    if ((startDate && dateObject < new Date(startDate)) || (endDate && dateObject > new Date(endDate))) {
      return { error: INVALID_DATE };
    }

    dateProfile = { scheduleDate, venues: [] };
    schedulingProfile.push(dateProfile);
  }

  let venueOnDate = dateProfile.venues.find((venue) => venue.venueId === venueId);

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
      .map((k) => (isObject(r[k]) ? hashRound(r[k]) : r[k]))
      .flat()
      .join('|');

  const roundExists = venueOnDate.rounds.find((existingRound) => hashRound(existingRound) === hashRound(round));
  if (roundExists) return decorateResult({ result: { error: EXISTING_ROUND }, stack });
  venueOnDate.rounds.push(round);

  const result = setSchedulingProfile({ tournamentRecords, schedulingProfile });
  if (result.error) return result;

  return { ...SUCCESS };
}
