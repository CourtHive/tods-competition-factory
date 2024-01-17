import { isValidExtension } from '../../../validators/isValidExtension';
import { isISODateString } from '../../../tools/dateTime';
import { validDateString } from '../../../validators/regex';
import { UUID } from '../../../tools/UUID';

import { INVALID_DATE } from '../../../constants/errorConditionConstants';

export function newTournamentRecord(params): any {
  const attributes = params || {};
  if (!attributes.tournamentId) attributes.tournamentId = UUID();
  if (attributes.startDate && !isISODateString(attributes.startDate) && !validDateString.test(attributes.startDate)) {
    return { error: INVALID_DATE };
  }

  if (attributes.endDate && !isISODateString(attributes.endDate) && !validDateString.test(attributes.endDate)) {
    return { error: INVALID_DATE };
  }

  if (attributes.extensions) {
    attributes.extensions = attributes.extensions.filter(isValidExtension);
  }

  return { ...attributes };
}
