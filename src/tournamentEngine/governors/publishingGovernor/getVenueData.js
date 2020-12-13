import { getCourtInfo } from './getCourtInfo';
import { findVenue } from '../../getters/venueGetter';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

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

  const venueData = Object.assign({}, venueInfo, { courtsInfo });

  return Object.assign({}, SUCCESS, { venueData });
}
