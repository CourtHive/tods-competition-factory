import { getCheckedInParticipantIds } from '@Query/matchUp/getCheckedInParticipantIds';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getMatchUpParticipantIds } from '@Query/matchUp/getMatchUpParticipantIds';
import { resolveFromParameters } from '@Helpers/parameters/resolveFromParameters';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { addMatchUpTimeItem } from './matchUpTimeItems';

// constants and types
import { INVALID_ACTION, INVALID_PARTICIPANT_ID, PARTICIPANT_NOT_CHECKED_IN } from '@Constants/errorConditionConstants';
import { activeMatchUpStatuses, completedMatchUpStatuses } from '@Constants/matchUpStatusConstants';
import { CheckInOutParticipantArgs } from '@Types/factoryTypes';
import { CHECK_OUT } from '@Constants/timeItemConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  DRAW_DEFINITION,
  IN_CONTEXT,
  MATCHUP,
  MATCHUP_ID,
  PARAM,
  PARTICIPANT_ID,
  TOURNAMENT_RECORD,
} from '@Constants/attributeConstants';

export function checkOutParticipant(params: CheckInOutParticipantArgs) {
  const requiredParams = [
    { [TOURNAMENT_RECORD]: true },
    { [DRAW_DEFINITION]: true },
    { [PARTICIPANT_ID]: true },
    { [MATCHUP_ID]: true },
  ];
  const paramCheck = checkRequiredParameters(params, requiredParams);
  if (paramCheck.error) return paramCheck;

  const resolutions = resolveFromParameters(params, [{ [PARAM]: MATCHUP, attr: { [IN_CONTEXT]: true } }]);
  if (resolutions.error) return resolutions;

  const { tournamentRecord, drawDefinition, participantId, matchUpId } = params;

  const matchUp = resolutions?.matchUp?.matchUp;
  const { matchUpStatus, score } = matchUp ?? {};

  if (
    (matchUpStatus && activeMatchUpStatuses.includes(matchUpStatus)) ||
    (matchUpStatus && completedMatchUpStatuses.includes(matchUpStatus)) ||
    checkScoreHasValue({ score })
  ) {
    return { error: INVALID_ACTION };
  }

  const getCheckedResult = getCheckedInParticipantIds({ matchUp });
  if (getCheckedResult?.error) return getCheckedResult;

  const { checkedInParticipantIds, allRelevantParticipantIds } = getCheckedResult ?? {};

  if (!allRelevantParticipantIds?.includes(participantId)) {
    return { error: INVALID_PARTICIPANT_ID };
  }
  if (!checkedInParticipantIds?.includes(participantId)) {
    return { error: PARTICIPANT_NOT_CHECKED_IN };
  }

  const getIdsResult = getMatchUpParticipantIds({ matchUp });
  if (getIdsResult?.error) return getIdsResult;

  const { sideParticipantIds, nestedIndividualParticipantIds } = getIdsResult ?? {};

  const sideIndex = sideParticipantIds?.indexOf(participantId);
  if (sideIndex !== undefined && [0, 1].includes(sideIndex)) {
    (nestedIndividualParticipantIds?.[sideIndex] ?? []).forEach((participantId) => {
      const timeItem = {
        itemType: CHECK_OUT,
        itemValue: participantId,
      };
      addMatchUpTimeItem({ drawDefinition, matchUpId, timeItem });
    });
  }

  const timeItem = {
    itemValue: participantId,
    itemType: CHECK_OUT,
  };

  addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });

  return { ...SUCCESS, checkedOut: true };
}
