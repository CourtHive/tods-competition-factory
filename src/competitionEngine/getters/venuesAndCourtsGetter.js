import { getVenuesAndCourts as teVenuesAndCourts } from '../../tournamentEngine/getters/venueGetter';
import { getDisabledStatus } from '../../global/functions/deducers/getDisabledStatus';
import { getInContextCourt } from '../../global/functions/deducers/getInContextCourt';
import { findExtension } from '../../global/functions/deducers/findExtension';
import { makeDeepCopy } from '../../utilities';

import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';
import { DISABLED } from '../../constants/extensionConstants';

export function getVenuesAndCourts({
  tournamentRecords,
  convertExtensions,
  ignoreDisabled,
  venueIds = [],
  dates, // used in conjunction with ignoreDisabled
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const venues = [];
  const courts = [];
  const uniqueVenueIds = [];
  const uniqueCourtIds = [];

  const tournamentIds = Object.keys(tournamentRecords);
  tournamentIds.forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    for (const venue of tournamentRecord.venues || []) {
      tournamentRecord.venues;
      if (venueIds.length && !venueIds.includes(venue.venueId)) continue;
      if (ignoreDisabled) {
        const { extension } = findExtension({
          name: DISABLED,
          element: venue,
        });
        if (extension?.value) continue;
      }
      if (!uniqueVenueIds.includes(venue.venueId)) {
        venues.push(makeDeepCopy(venue, convertExtensions, true));
        uniqueVenueIds.push(venue.venueId);
      }
      for (const court of venue.courts || []) {
        if (!uniqueCourtIds.includes(court.courtId)) {
          // if dates are provided, only ignore the court if it is disabled for all given dates
          if (ignoreDisabled && dates) {
            const { extension } = findExtension({
              name: DISABLED,
              element: court,
            });
            const isDisabled = getDisabledStatus({ extension, dates });
            if (isDisabled) continue;
          }
          const { inContextCourt } = getInContextCourt({
            convertExtensions,
            ignoreDisabled,
            venue,
            court,
          });

          courts.push(inContextCourt);
          uniqueCourtIds.push(court.courtId);
        }
      }
    }
  });

  return { courts, venues };
}

export function getCompetitionVenues({
  tournamentRecords,
  requireCourts,
  dates,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  return tournamentIds.reduce(
    (accumulator, tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const { venues } = teVenuesAndCourts({ tournamentRecord, dates });
      venues.forEach((venue) => {
        const { venueId, courts } = venue;
        const includeVenue = !requireCourts || courts?.length;
        if (includeVenue && !accumulator.venueIds.includes(venueId)) {
          accumulator.venues.push(venue);
          accumulator.venueIds.push(venueId);
        }
      });
      return accumulator;
    },
    { venues: [], venueIds: [] }
  );
}
