import { modifyCourtAvailability } from './courtAvailability';
import courtTemplate from '../../generators/courtTemplate';
import { addNotice } from '../../../global/state/globalState';
import { findCourt } from '../../getters/courtGetter';
import { makeDeepCopy } from '../../../utilities';

import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_OBJECT,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';

export function modifyCourt({
  tournamentRecord,
  modifications,
  disableNotice,
  venueMatchUps,
  courtId,
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

  const validModificationAttributes = Object.keys(modifications).filter(
    (attribute) => validAttributes.includes(attribute)
  );

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  // not valid to replace the dateAvailability array
  const validReplacements = validAttributes.filter(
    (attribute) => !['dateAvailability'].includes(attribute)
  );

  const validReplacementAttributes = Object.keys(modifications).filter(
    (attribute) => validReplacements.includes(attribute)
  );

  validReplacementAttributes.forEach((attribute) =>
    Object.assign(court, { [attribute]: modifications[attribute] })
  );

  if (modifications.dateAvailability) {
    const result = modifyCourtAvailability({
      dateAvailability: modifications.dateAvailability,
      tournamentRecord,
      venueMatchUps,
      disableNotice,
      courtId,
      force,
    });
    if (result.error) return result;
  }

  if (!disableNotice) {
    addNotice({
      payload: { venue, tournamentId: tournamentRecord.tournamentId },
      topic: MODIFY_VENUE,
      key: venue.venueId,
    });
  }

  return { ...SUCCESS, court: makeDeepCopy(court) };
}
