import { getCheckedInParticipantIds } from '../../../query/matchUp/getCheckedInParticipantIds';
import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { resolveFromParameters } from '../../../parameters/resolveFromParameters';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { INVALID_PARTICIPANT_ID } from '../../../constants/errorConditionConstants';
import { CheckInOutParticipantArgs } from '../../../types/factoryTypes';
import { CHECK_IN } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_DEFINITION,
  MATCHUP_ID,
  PARTICIPANT_ID,
  TOURNAMENT_RECORD,
} from '../../../constants/attributeConstants';

export function checkInParticipant(params: CheckInOutParticipantArgs) {
  const requiredParams = [
    { [TOURNAMENT_RECORD]: true, type: 'object' },
    { [DRAW_DEFINITION]: true, type: 'object' },
    { [PARTICIPANT_ID]: true },
    { [MATCHUP_ID]: true },
  ];
  const paramCheck = checkRequiredParameters(params, requiredParams);
  if (paramCheck.error) return paramCheck;

  const resolutions = resolveFromParameters(params, [
    { param: 'matchUp', attr: { inContext: true } },
  ]);
  if (resolutions.error) return resolutions;

  const { tournamentRecord, drawDefinition, participantId, matchUpId } = params;
  const { matchUp } = resolutions;

  const result = getCheckedInParticipantIds({
    matchUp,
  });
  if (result?.error) return result;

  const { checkedInParticipantIds, allRelevantParticipantIds } = result ?? {};

  if (checkedInParticipantIds?.includes(participantId)) return { ...SUCCESS };

  if (!allRelevantParticipantIds?.includes(participantId))
    return { error: INVALID_PARTICIPANT_ID };

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
