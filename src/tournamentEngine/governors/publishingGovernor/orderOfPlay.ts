import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';
import { getTournamentTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  UNPUBLISH_ORDER_OF_PLAY,
  PUBLISH_ORDER_OF_PLAY,
} from '../../../constants/topicConstants';

export function unPublishOrderOfPlay({
  removePriorValues = true,
  tournamentRecord,
  status = PUBLIC,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getTournamentTimeItem({
    tournamentRecord,
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
    },
  });

  return { ...SUCCESS };
}

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
    tournamentRecord,
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
    tournamentRecord,
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
