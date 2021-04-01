import { modifyCourtAvailability } from './courtAvailability';
import { addNotice } from '../../../global/globalState';
import courtTemplate from '../../generators/courtTemplate';
import { findCourt } from '../../getters/courtGetter';
import { makeDeepCopy } from '../../../utilities';

import {
  INVALID_OBJECT,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyCourt({
  tournamentRecord,
  courtId,
  modifications,
  force,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };
  if (!modifications || typeof modifications !== 'object')
    return { error: INVALID_OBJECT };

  const { court, venue, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  // not valid to modify a courtId
  const validAttributes = Object.keys(courtTemplate()).filter(
    (attribute) => attribute !== 'courtId'
  );

  const validModificationAttributes = Object.keys(
    modifications
  ).filter((attribute) => validAttributes.includes(attribute));

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  // not valid to replace the dateAvailability array
  const validReplacements = validAttributes.filter(
    (attribute) => !['dateAvailability'].includes(attribute)
  );

  const validReplacementAttributes = Object.keys(
    modifications
  ).filter((attribute) => validReplacements.includes(attribute));

  validReplacementAttributes.forEach((attribute) =>
    Object.assign(court, { [attribute]: modifications[attribute] })
  );

  const errors = [];
  if (modifications.dateAvailability) {
    const result = modifyCourtAvailability({
      tournamentRecord,
      dateAvailability: modifications.dateAvailability,
      courtId,
      force,
    });
    if (result.error) errors.push(result);
  }

  addNotice({ topic: 'modifyVenue', payload: { venue } });
  return Object.assign({}, SUCCESS, { court: makeDeepCopy(court) });
}
