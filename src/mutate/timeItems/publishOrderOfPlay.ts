import { resolveTournamentRecords } from '../../parameters/resolveTournamentRecords';
import { addNotice } from '../../global/state/globalState';
import { getTimeItem } from '../../query/base/timeItems';
import { addTimeItem } from './addTimeItem';

import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { PUBLISH_ORDER_OF_PLAY } from '../../constants/topicConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';

export function publishOrderOfPlay(params) {
  const tournamentRecords = resolveTournamentRecords(params);

  if (!Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = publishOOP({
      tournamentRecord,
      ...params,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

function publishOOP({
  scheduledDates = [],
  removePriorValues,
  tournamentRecord,
  status = PUBLIC,
  eventIds = [],
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getTimeItem({
    element: tournamentRecord,
    itemType,
  });

  const itemValue = timeItem?.itemValue || { [status]: {} };

  itemValue[status].orderOfPlay = { published: true, scheduledDates, eventIds };

  const updatedTimeItem = {
    itemValue,
    itemType,
  };

  addTimeItem({
    timeItem: updatedTimeItem,
    element: tournamentRecord,
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
