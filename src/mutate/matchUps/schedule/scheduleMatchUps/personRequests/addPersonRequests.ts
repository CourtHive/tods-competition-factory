import { checkRequiredParameters } from '../../../../../parameters/checkRequiredParameters';
import { mergePersonRequests } from './mergePersonRequests';
import { savePersonRequests } from './savePersonRequests';
import { getPersonRequests } from '../../../../../query/matchUps/scheduling/getPersonRequests';

import { INVALID_VALUES } from '../../../../../constants/errorConditionConstants';
import { TournamentRecords } from '../../../../../types/factoryTypes';
import {
  ARRAY,
  INVALID,
  OF_TYPE,
  PERSON_ID,
  TOURNAMENT_RECORDS,
} from '../../../../../constants/attributeConstants';

type AddPersonRequestsArgs = {
  tournamentRecords: TournamentRecords;
  requests: Request[];
  personId: string;
};
export function addPersonRequests(params: AddPersonRequestsArgs) {
  const { tournamentRecords, personId, requests } = params;
  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true, [PERSON_ID]: true },
    { requests: true, [OF_TYPE]: ARRAY, [INVALID]: INVALID_VALUES },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const { personRequests } = getPersonRequests({ tournamentRecords });

  const { mergeCount } = mergePersonRequests({
    personRequests,
    personId,
    requests,
  });

  if (mergeCount && personRequests) {
    return savePersonRequests({ tournamentRecords, personRequests });
  } else {
    return { error: INVALID_VALUES };
  }
}
