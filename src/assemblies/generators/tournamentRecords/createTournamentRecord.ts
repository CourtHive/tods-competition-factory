import { isValidExtension } from '@Validators/isValidExtension';
import { isISODateString } from '@Tools/dateTime';
import { validDateString } from '@Validators/regex';
import { UUID } from '@Tools/UUID';

// constants
import { INVALID_DATE } from '@Constants/errorConditionConstants';

export function createTournamentRecord(params): any {
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
