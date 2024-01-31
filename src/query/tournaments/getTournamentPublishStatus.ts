import { getTournamentTimeItem } from '@Query/base/timeItems';

import { PUBLIC, PUBLISH, STATUS } from '@Constants/timeItemConstants';

export function getTournamentPublishStatus({ tournamentRecord, status = PUBLIC }) {
  const itemType = `${PUBLISH}.${STATUS}`;
  return getTournamentTimeItem({
    tournamentRecord,
    itemType,
  })?.timeItem?.itemValue?.[status];
}
