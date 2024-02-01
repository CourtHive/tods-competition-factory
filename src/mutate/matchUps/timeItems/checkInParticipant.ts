import { getCheckedInParticipantIds } from '@Query/matchUp/getCheckedInParticipantIds';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { resolveFromParameters } from '@Helpers/parameters/resolveFromParameters';
import { addMatchUpTimeItem } from './matchUpTimeItems';

// constants and types
import { INVALID_PARTICIPANT_ID } from '@Constants/errorConditionConstants';
import { CheckInOutParticipantArgs } from '@Types/factoryTypes';
import { CHECK_IN } from '@Constants/timeItemConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  DRAW_DEFINITION,
  ERROR,
  IN_CONTEXT,
  MATCHUP,
  MATCHUP_ID,
  PARAM,
  PARTICIPANT_ID,
  TOURNAMENT_RECORD,
} from '@Constants/attributeConstants';

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
  if (!allRelevantParticipantIds?.includes(participantId)) return { [ERROR]: INVALID_PARTICIPANT_ID };

  const confirmation = { ...SUCCESS, checkedIn: true };
  if (checkedInParticipantIds?.includes(participantId)) return confirmation;

  const timeItem = {
    itemValue: participantId,
    itemType: CHECK_IN,
  };

  addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });

  return confirmation;
}
