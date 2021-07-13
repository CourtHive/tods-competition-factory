import { findVenue } from '../../getters/venueGetter';
import { makeDeepCopy } from '../../../utilities';
import { getCourtInfo } from './getCourtInfo';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
} from '../../../constants/errorConditionConstants';

// The only difference from finding a venue is that information is filtered from both venue and courts
// e.g. dataAvailability objects are not returned.
export function getVenueData({ tournamentRecord, venueId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const { venue, error } = findVenue({ tournamentRecord, venueId });
  if (error) return { error };

  const courts = venue.courts || [];
  const courtsInfo = courts.map((court) =>
    (({ courtInfo }) => ({
      ...courtInfo,
    }))(
      getCourtInfo({
        tournamentRecord,
        courtId: court.courtId,
      })
    )
  );

  const venueInfo = (({ venueId, venueName, venueAbbreviation }) => ({
    venueId,
    venueName,
    venueAbbreviation,
  }))(venue);

  const venueData = { ...venueInfo, courtsInfo };

  return { ...SUCCESS, venueData: makeDeepCopy(venueData) };
}
