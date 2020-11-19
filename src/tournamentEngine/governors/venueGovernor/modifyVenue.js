import { findVenue } from '../../getters/venueGetter';
import venueTemplate from '../../generators/venueTemplate';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { makeDeepCopy } from '../../../utilities';

export function modifyVenue({ tournamentRecord, venueId, modifications }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const { venue, error } = findVenue({ tournamentRecord, venueId });
  if (error) return { error };

  const validAttributes = Object.keys(venueTemplate()).filter(
    attribute => !['courtId', 'courts'].includes(attribute)
  );

  const validModificationAttributes = Object.keys(
    modifications
  ).filter(attribute => validAttributes.includes(attribute));

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  validModificationAttributes.forEach(attribute =>
    Object.assign(venue, { [attribute]: modifications[attribute] })
  );

  return Object.assign({}, SUCCESS, { venue: makeDeepCopy(venue) });
}
