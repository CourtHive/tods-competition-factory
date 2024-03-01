import { addMatchUpTimeItem } from '@Mutate/timeItems/matchUps/matchUpTimeItems';

// constants and types
import { AddScheduleAttributeArgs, ResultType } from '@Types/factoryTypes';
import { HOME_PARTICIPANT_ID } from '@Constants/timeItemConstants';

export function setMatchUpHomeParticipantId(
  params: AddScheduleAttributeArgs & { homeParticipantId?: string },
): ResultType {
  const {
    disableNotice = true,
    homeParticipantId,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    matchUpId,
  } = params;

  const timeItem = {
    itemValue: homeParticipantId,
    itemType: HOME_PARTICIPANT_ID,
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
