import { isValidExtension } from '../../global/validation/isValidExtension';
import { validDateString } from '../../fixtures/validations/regex';
import { isISODateString } from '../../utilities/dateTime';

import { INVALID_DATE } from '../../constants/errorConditionConstants';
import { UUID } from '../../utilities';

export function newTournamentRecord(params): any {
  const attributes = params || {};
  if (!attributes.tournamentId) attributes.tournamentId = UUID();
  if (
    attributes.startDate &&
    !isISODateString(attributes.startDate) &&
    !validDateString.test(attributes.startDate)
  ) {
    return { error: INVALID_DATE };
  }

  if (
    attributes.endDate &&
    !isISODateString(attributes.endDate) &&
    !validDateString.test(attributes.endDate)
  ) {
    return { error: INVALID_DATE };
  }

  if (attributes.extensions) {
    attributes.extensions = attributes.extensions.filter(isValidExtension);
  }

  return { ...attributes };
}
