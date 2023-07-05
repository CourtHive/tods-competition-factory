import { isValidExtension } from '../../global/validation/isValidExtension';
import { validDateString } from '../../fixtures/validations/regex';
import { isISODateString } from '../../utilities/dateTime';

import { INVALID_DATE } from '../../constants/errorConditionConstants';
import { UUID } from '../../utilities';

export function newTournamentRecord(params = {}) {
  if (!params.tournamentId) Object.assign(params, { tournamentId: UUID() });
  if (params.startDate && (!isISODateString(params.startDate) && !validDateString.test(params.startDate))) {
      return { error: INVALID_DATE };
  }

  if (params.endDate && (!isISODateString(params.endDate) && !validDateString.test(params.endDate))) {
      return { error: INVALID_DATE };
  }

  if (params.extensions) {
    params.extensions = params.extensions.filter(isValidExtension);
  }

  return { ...params };
}
