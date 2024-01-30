import { getDisabledStatus } from '@Query/extensions/getDisabledStatus';
import { getInContextCourt } from './getInContextCourt';
import { findExtension } from '@Acquire/findExtension';
import { makeDeepCopy } from '@Tools/makeDeepCopy';

// constants and types
import { ErrorType, MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { TournamentRecords, ResultType } from '@Types/factoryTypes';
import { HydratedCourt, HydratedVenue } from '@Types/hydrated';
import { Tournament, Venue } from '@Types/tournamentTypes';
import { DISABLED } from '@Constants/extensionConstants';
import { SUCCESS } from '@Constants/resultConstants';

type GetVenuesAndCourtsArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  convertExtensions?: boolean;
  ignoreDisabled?: boolean;
  tournamentId?: string;
  venueIds?: string[];
  dates?: string[];
};
export function getVenuesAndCourts(params: GetVenuesAndCourtsArgs): ResultType & {
  venues?: HydratedVenue[];
  courts?: HydratedCourt[];
} {
  const {
    convertExtensions,
    ignoreDisabled,
    venueIds = [],
    dates, // used in conjunction with ignoreDisabled
  } = params;

  const tournamentRecords =
    params.tournamentRecords ||
    (params.tournamentRecord && {
      [params.tournamentRecord.tournamentId]: params.tournamentRecord,
    }) ||
    {};

  const uniqueVenueIds: string[] = [];
  const uniqueCourtIds: string[] = [];
  const courts: HydratedCourt[] = [];
  const venues: HydratedVenue[] = [];

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (id) => !params.tournamentId || id === params.tournamentId,
  );
  tournamentIds.forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    for (const venue of tournamentRecord.venues ?? []) {
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
      for (const court of venue.courts ?? []) {
        if (!uniqueCourtIds.includes(court.courtId)) {
          // if dates are provided, only ignore the court if it is disabled for all given dates
          if (ignoreDisabled) {
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

  return { courts, venues, ...SUCCESS };
}

export function getTournamentVenuesAndCourts({
  convertExtensions,
  tournamentRecord,
  ignoreDisabled,
  dates, // used in conjunction with ignoreDisabled
}: GetVenuesAndCourtsArgs): ResultType & {
  venues?: HydratedVenue[];
  courts?: HydratedCourt[];
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORDS };

  const venues = makeDeepCopy(tournamentRecord.venues ?? [], convertExtensions)
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
        if (!ignoreDisabled && !dates?.length) return court;
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

type Accumulator = {
  venueIds: string[];
  venues: Venue[];
};

type GetCompeitionVenuesArgs = {
  tournamentRecords: TournamentRecords;
  requireCourts?: boolean;
  dates?: string[];
};

export function getCompetitionVenues({ tournamentRecords, requireCourts, dates }: GetCompeitionVenuesArgs): {
  venueIds?: string[];
  error?: ErrorType;
  venues?: Venue[];
} {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  return tournamentIds.reduce(
    (accumulator: Accumulator, tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const { venues } = getTournamentVenuesAndCourts({
        tournamentRecord,
        dates,
      });
      venues?.forEach((venue) => {
        const { venueId, courts } = venue;
        const includeVenue = !requireCourts || courts?.length;
        if (includeVenue && !accumulator.venueIds.includes(venueId)) {
          accumulator.venues.push(venue);
          accumulator.venueIds.push(venueId);
        }
      });
      return accumulator;
    },
    { venues: [], venueIds: [] },
  );
}
