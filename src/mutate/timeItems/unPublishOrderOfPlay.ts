import { addNotice } from '../../global/state/globalState';
import { getTimeItem } from '../../query/base/timeItems';
import { addTimeItem } from './addTimeItem';

import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { UNPUBLISH_ORDER_OF_PLAY } from '../../constants/topicConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { MISSING_TOURNAMENT_RECORD, MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';

export function unPublishOrderOfPlay(params) {
  const tournamentRecords =
    params?.tournamentRecords ??
    (params?.tournamentRecord && {
      [params.tournamentRecord.tournamentId]: params.tournamentRecord,
    }) ??
    {};

  if (!Object.keys(tournamentRecords).length) return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = unPublishOOP({
      tournamentRecord,
      ...params,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

function unPublishOOP({ removePriorValues = true, tournamentRecord, status = PUBLIC }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getTimeItem({
    element: tournamentRecord,
    itemType,
  });

  const itemValue = timeItem?.itemValue || { [status]: {} };

  if (itemValue[status]) delete itemValue[status].orderOfPlay;

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
    topic: UNPUBLISH_ORDER_OF_PLAY,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
    },
  });

  return { ...SUCCESS };
}
