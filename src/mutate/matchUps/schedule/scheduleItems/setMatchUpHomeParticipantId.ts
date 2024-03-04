import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { resolveFromParameters } from '@Helpers/parameters/resolveFromParameters';
import { addMatchUpTimeItem } from '@Mutate/timeItems/matchUps/matchUpTimeItems';

// constants and types
import { INVALID_PARTICIPANT_ID, MISSING_PARTICIPANT_ID } from '@Constants/errorConditionConstants';
import { AddScheduleAttributeArgs, ResultType } from '@Types/factoryTypes';
import { HOME_PARTICIPANT_ID } from '@Constants/timeItemConstants';
import {
  DRAW_DEFINITION,
  ERROR,
  IN_CONTEXT,
  MATCHUP,
  MATCHUP_ID,
  PARAM,
  TOURNAMENT_RECORD,
} from '@Constants/attributeConstants';

export function setMatchUpHomeParticipantId(
  params: AddScheduleAttributeArgs & { homeParticipantId?: string },
): ResultType {
  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORD]: true, [DRAW_DEFINITION]: true, [MATCHUP_ID]: true },
    { homeParticipantId: true, [ERROR]: MISSING_PARTICIPANT_ID },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const resolutions = resolveFromParameters(params, [{ [PARAM]: MATCHUP, attr: { [IN_CONTEXT]: true } }]);
  if (resolutions.error) return resolutions;

  const participantIds = resolutions?.matchUp?.matchUp?.sides?.map((side) => side?.participantId);
  if (params.homeParticipantId && !participantIds?.includes(params.homeParticipantId))
    return { error: INVALID_PARTICIPANT_ID };

  const {
    disableNotice = true,
    homeParticipantId,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    matchUpId,
  } = params;

  const timeItem = {
    itemType: HOME_PARTICIPANT_ID,
    itemValue: homeParticipantId,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}
