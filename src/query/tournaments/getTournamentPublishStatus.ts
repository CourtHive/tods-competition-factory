import { getTournamentTimeItem } from 'query/base/timeItems';

import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';

export function getTournamentPublishStatus({ tournamentRecord, status = PUBLIC }) {
  const itemType = `${PUBLISH}.${STATUS}`;
  return getTournamentTimeItem({
    tournamentRecord,
    itemType,
  })?.timeItem?.itemValue?.[status];
}
