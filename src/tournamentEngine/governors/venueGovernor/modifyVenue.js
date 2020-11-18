import { findVenue } from '../../getters/venueGetter';
import venueTemplate from '../../generators/venueTemplate';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyVenue({ tournamentRecord, venueId, modifications }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const { venue, error } = findVenue({ tournamentRecord, venueId });
  if (error) return { error };

  const validAttributes = Object.keys(venueTemplate()).filter(
    attribute => attribute !== 'courtId'
  );

  if (!validAttributes.length) return { error: NO_VALID_ATTRIBUTES };

  validAttributes.forEach(attribute =>
    Object.assign(venue, { [attribute]: modifications[attribute] })
  );

  return SUCCESS;
}
