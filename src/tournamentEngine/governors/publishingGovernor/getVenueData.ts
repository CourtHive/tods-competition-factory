import { findVenue } from '../../getters/venueGetter';
import { makeDeepCopy } from '../../../utilities';
import { getCourtInfo } from './getCourtInfo';

import { Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
} from '../../../constants/errorConditionConstants';

// The only difference from finding a venue is that information is filtered from both venue and courts
// e.g. dataAvailability objects are not returned.

type GetVenueDataArgs = {
  tournamentRecord: Tournament;
  venueId: string;
};
export function getVenueData({ tournamentRecord, venueId }: GetVenueDataArgs): {
  success?: boolean;
  error?: ErrorType;
  venueData?: any;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const result = findVenue({ tournamentRecord, venueId });
  if (result.error) return result;

  const courts = result.venue?.courts ?? [];
  const courtsInfo = courts.map((court) =>
    (({ courtInfo }) => ({
      ...courtInfo,
    }))(
      getCourtInfo({
        courtId: court.courtId,
        internalUse: true,
        tournamentRecord,
      })
    )
  );

  const venueInfo =
    result.venue &&
    (({ venueId, venueName, venueAbbreviation }) => ({
      venueAbbreviation,
      venueName,
      venueId,
    }))(result.venue);

  const venueData = venueInfo && { ...venueInfo, courtsInfo };

  return { ...SUCCESS, venueData: makeDeepCopy(venueData, false, true) };
}
