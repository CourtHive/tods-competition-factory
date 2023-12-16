import { getCheckedInParticipantIds } from '../../../query/matchUp/getCheckedInParticipantIds';
import { getMatchUpParticipantIds } from '../../../query/matchUp/getMatchUpParticipantIds';
import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { resolveFromParameters } from '../../../parameters/resolveFromParameters';
import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { CheckInOutParticipantArgs } from '../../../types/factoryTypes';
import { CHECK_OUT } from '../../../constants/timeItemConstants';
import {
  INVALID_ACTION,
  INVALID_PARTICIPANT_ID,
  PARTICIPANT_NOT_CHECKED_IN,
} from '../../../constants/errorConditionConstants';
import {
  activeMatchUpStatuses,
  completedMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';

export function checkOutParticipant(params: CheckInOutParticipantArgs) {
  const requiredParams = [
    { tournamentRecord: true, type: 'object' },
    { drawDefinition: true, type: 'object' },
    { participantId: true },
    { matchUpId: true },
  ];
  const paramCheck = checkRequiredParameters(params, requiredParams);
  if (paramCheck.error) return paramCheck;

  const resolutions = resolveFromParameters(params, [
    { param: 'matchUp', attr: { inContext: true } },
  ]);
  if (resolutions.error) return resolutions;

  const { tournamentRecord, drawDefinition, participantId, matchUpId } = params;
  const { matchUp } = resolutions;

  const { matchUpStatus, score } = matchUp ?? {};

  if (
    (matchUpStatus && activeMatchUpStatuses.includes(matchUpStatus)) ||
    (matchUpStatus && completedMatchUpStatuses.includes(matchUpStatus)) ||
    checkScoreHasValue({ score })
  ) {
    return { error: INVALID_ACTION };
  }

  const getCheckedResult = getCheckedInParticipantIds({
    matchUp,
  });
  if (getCheckedResult?.error) return getCheckedResult;
  const { checkedInParticipantIds, allRelevantParticipantIds } =
    getCheckedResult ?? {};

  if (!allRelevantParticipantIds?.includes(participantId)) {
    return { error: INVALID_PARTICIPANT_ID };
  }
  if (!checkedInParticipantIds?.includes(participantId)) {
    return { error: PARTICIPANT_NOT_CHECKED_IN };
  }

  const getIdsResult = getMatchUpParticipantIds({ matchUp });
  if (getIdsResult?.error) return getIdsResult;

  const { sideParticipantIds, nestedIndividualParticipantIds } =
    getIdsResult ?? {};

  const sideIndex = sideParticipantIds?.indexOf(participantId);
  if (sideIndex !== undefined && [0, 1].includes(sideIndex)) {
    (nestedIndividualParticipantIds?.[sideIndex] ?? []).forEach(
      (participantId) => {
        const timeItem = {
          itemType: CHECK_OUT,
          itemValue: participantId,
        };
        addMatchUpTimeItem({ drawDefinition, matchUpId, timeItem });
      }
    );
  }

  const timeItem = {
    itemValue: participantId,
    itemType: CHECK_OUT,
  };

  return addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });
}
