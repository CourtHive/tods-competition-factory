import { getCheckedInParticipantIds } from '../../../query/matchUp/getCheckedInParticipantIds';
import { checkRequiredParameters } from '../../../helpers/parameters/checkRequiredParameters';
import { resolveFromParameters } from '../../../helpers/parameters/resolveFromParameters';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { INVALID_PARTICIPANT_ID } from '../../../constants/errorConditionConstants';
import { CheckInOutParticipantArgs } from '../../../types/factoryTypes';
import { CHECK_IN } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_DEFINITION,
  ERROR,
  IN_CONTEXT,
  MATCHUP,
  MATCHUP_ID,
  PARAM,
  PARTICIPANT_ID,
  TOURNAMENT_RECORD,
} from '../../../constants/attributeConstants';

export function checkInParticipant(params: CheckInOutParticipantArgs) {
  const requiredParams = [
    { [TOURNAMENT_RECORD]: true },
    { [DRAW_DEFINITION]: true },
    { [PARTICIPANT_ID]: true },
    { [MATCHUP_ID]: true },
  ];
  const paramCheck = checkRequiredParameters(params, requiredParams);
  if (paramCheck[ERROR]) return paramCheck;

  const resolutions = resolveFromParameters(params, [{ [PARAM]: MATCHUP, attr: { [IN_CONTEXT]: true } }]);
  if (resolutions[ERROR]) return resolutions;

  const { tournamentRecord, drawDefinition, participantId, matchUpId } = params;

  const result = getCheckedInParticipantIds({
    matchUp: resolutions?.matchUp?.matchUp,
  });
  if (result?.error) return result;

  const { checkedInParticipantIds, allRelevantParticipantIds } = result ?? {};

  if (checkedInParticipantIds?.includes(participantId)) return { ...SUCCESS };

  if (!allRelevantParticipantIds?.includes(participantId)) return { [ERROR]: INVALID_PARTICIPANT_ID };

  const timeItem = {
    itemValue: participantId,
    itemType: CHECK_IN,
  };

  return addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });
}
