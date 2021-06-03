import { validDateString } from '../../fixtures/validations/regex';
import { isISODateString } from '../../utilities/dateTime';

import { INVALID_DATE } from '../../constants/errorConditionConstants';
import { UUID } from '../../utilities';

export function newTournamentRecord(props = {}) {
  if (!props.tournamentId) Object.assign(props, { tournamentId: UUID() });
  if (props.startDate) {
    if (
      !isISODateString(props.startDate) &&
      !validDateString.test(props.startDate)
    )
      return { error: INVALID_DATE };
  }
  if (props.endDate) {
    if (!isISODateString(props.endDate) && !validDateString.test(props.endDate))
      return { error: INVALID_DATE };
  }
  return Object.assign({}, props);
}
