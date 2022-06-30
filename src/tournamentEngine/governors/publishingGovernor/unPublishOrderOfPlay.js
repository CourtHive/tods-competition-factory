import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';
import { getTournamentTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { UNPUBLISH_ORDER_OF_PLAY } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function unPublishOrderOfPlay({
  removePriorValues,
  tournamentRecord,
  status = PUBLIC,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getTournamentTimeItem({
    itemType,
  });

  const itemValue = timeItem?.itemValue || { [status]: {} };

  if (itemValue[status]) delete itemValue[status].orderOfPlay;

  const updatedTimeItem = {
    itemValue,
    itemType,
  };

  addTournamentTimeItem({
    timeItem: updatedTimeItem,
    removePriorValues,
    tournamentRecord,
  });
  addNotice({
    topic: UNPUBLISH_ORDER_OF_PLAY,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      eventId: event.eventId,
    },
  });

  return { ...SUCCESS };
}
