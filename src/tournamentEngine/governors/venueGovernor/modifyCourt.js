import {
  INVALID_OBJECT,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { makeDeepCopy } from '../../../utilities';
import courtTemplate from '../../generators/courtTemplate';
import { findCourt } from '../../getters/courtGetter';

export function modifyCourt({ tournamentRecord, courtId, modifications }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };
  if (!modifications || typeof modifications !== 'object')
    return { error: INVALID_OBJECT };

  const { court, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  const validAttributes = Object.keys(courtTemplate()).filter(
    attribute => attribute !== 'courtId'
  );

  const validModificationAttributes = Object.keys(
    modifications
  ).filter(attribute => validAttributes.includes(attribute));

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  validModificationAttributes.forEach(attribute =>
    Object.assign(court, { [attribute]: modifications[attribute] })
  );

  return Object.assign({}, SUCCESS, { court: makeDeepCopy(court) });
}
