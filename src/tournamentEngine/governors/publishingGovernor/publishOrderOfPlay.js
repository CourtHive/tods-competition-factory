import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';
import { getTournamentTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { PUBLISH_ORDER_OF_PLAY } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function publishOrderOfPlay({
  scheduledDates = [],
  removePriorValues,
  tournamentRecord,
  status = PUBLIC,
  eventIds = [],
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getTournamentTimeItem({
    itemType,
  });

  const itemValue = timeItem?.itemValue || { [status]: {} };

  itemValue[status].orderOfPlay = { published: true, scheduledDates, eventIds };

  const updatedTimeItem = {
    itemValue,
    itemType,
  };

  addTournamentTimeItem({
    timeItem: updatedTimeItem,
    removePriorValues,
  });
  addNotice({
    topic: PUBLISH_ORDER_OF_PLAY,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      scheduledDates,
      eventIds,
    },
  });

  return { ...SUCCESS };
}
