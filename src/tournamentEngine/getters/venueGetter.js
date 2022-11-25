import { getLinkedTournamentIds } from '../../competitionEngine/governors/competitionsGovernor/tournamentLinks';
import { getDisabledStatus } from '../../global/functions/deducers/getDisabledStatus';
import { getInContextCourt } from '../../global/functions/deducers/getInContextCourt';
import { findExtension } from '../../global/functions/deducers/findExtension';
import { addVenue } from '../governors/venueGovernor/addVenue';
import { makeDeepCopy } from '../../utilities';

import { DISABLED } from '../../constants/extensionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export function getVenuesAndCourts({
  convertExtensions,
  tournamentRecord,
  ignoreDisabled,
  dates, // used in conjunction with ignoreDisabled
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const venues = makeDeepCopy(tournamentRecord.venues || [], convertExtensions)
    .filter((venue) => {
      if (!ignoreDisabled) return venue;
      const { extension } = findExtension({
        name: DISABLED,
        element: venue,
      });
      return !extension?.value && venue;
    })
    .filter(Boolean);

  const courts = venues.reduce((courts, venue) => {
    const additionalCourts = (venue?.courts || [])
      .filter((court) => {
        if (!ignoreDisabled) return court;
        const { extension } = findExtension({
          name: DISABLED,
          element: court,
        });
        return getDisabledStatus({ extension, dates });
      })
      .filter(Boolean)
      .map((court) => {
        const { inContextCourt } = getInContextCourt({
          convertExtensions,
          ignoreDisabled,
          venue,
          court,
        });

        return inContextCourt;
      });

    return additionalCourts.length ? courts.concat(additionalCourts) : courts;
  }, []);

  return { venues, courts };
}

export function findVenue({ tournamentRecords, tournamentRecord, venueId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };
  const venues = tournamentRecord.venues || [];
  let venue = venues.reduce((venue, venueRecord) => {
    return venueRecord.venueId === venueId ? venueRecord : venue;
  }, undefined);

  if (!venue && tournamentRecords) {
    const linkedTournamentIds = getLinkedTournamentIds({
      tournamentRecords,
    }).linkedTournamentIds;

    const relevantIds = linkedTournamentIds[tournamentRecord.tournamentId];

    // if there are linked tournaments search for court in all linked tournaments
    for (const tournamentId of relevantIds) {
      const record = tournamentRecords[tournamentId];
      const result = findVenue({ tournamentRecord: record, venueId });
      // if venue is found in linked tournamentRecords, add venue to original tournamentRecord
      if (result.success) {
        addVenue({ tournamentRecord, venue: result.venue });
        return { ...SUCCESS, venue };
      }
    }
  }

  if (!venue) {
    return { error: VENUE_NOT_FOUND };
  } else {
    return { ...SUCCESS, venue };
  }
}

export function publicFindVenue({ convertExtensions, ...params }) {
  return makeDeepCopy(findVenue(params), convertExtensions, true);
}
