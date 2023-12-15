import { getCheckedInParticipantIds } from '../../query/matchUp/getCheckedInParticipantIds';
import { checkRequiredParameters } from '../../parameters/checkRequiredParameters';
import { resolveFromParameters } from '../../parameters/resolveFromParameters';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { INVALID_PARTICIPANT_ID } from '../../constants/errorConditionConstants';
import { CheckInOutParticipantArgs } from '../../types/factoryTypes';
import { CHECK_IN } from '../../constants/timeItemConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function checkInParticipant(params: CheckInOutParticipantArgs) {
  const requiredParams = [
    { param: 'tournamentRecord', type: 'object' },
    { param: 'drawDefinition', type: 'object' },
    { param: 'participantId' },
    { param: 'matchUpId' },
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
