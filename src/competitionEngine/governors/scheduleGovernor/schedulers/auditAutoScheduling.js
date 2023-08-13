import { addTournamentTimeItem } from '../../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { addNotice } from '../../../../global/state/globalState';

import { AUTO_SCHEDULING_AUDIT } from '../../../../constants/auditConstants';
import { AUDIT } from '../../../../constants/topicConstants';

export function auditAutoScheduling({
  autoSchedulingAudit,
  tournamentRecords,
}) {
  addNotice({ topic: AUDIT, payload: autoSchedulingAudit });

  const getCount = (obj) => {
    if (!obj) return 0;
    const values = Object.values(obj);
    return values.reduce((count, value) => count + value.length || 0, 0);
  };

  const profileRoundsCount = (
    autoSchedulingAudit?.schedulingProfile || []
  ).reduce(
    (count, dateProfile) =>
      count +
      dateProfile.venues.reduce((vc, venue) => vc + venue.rounds.length, 0),
    0
  );

  const itemValue = {
    scheduledDatesCount: autoSchedulingAudit.scheduledDates?.length,
    noTimeMatchUpIdsCount: getCount(autoSchedulingAudit?.noTimeMatchUpIds),
    scheduledMatchUpIdsCount: getCount(
      autoSchedulingAudit?.scheduledMatchUpIds
    ),
    overLimitMatchUpIdsCount: getCount(
      autoSchedulingAudit?.overLimitMatchUpIds
    ),
    requestConflictsCount: getCount(autoSchedulingAudit?.requestConflicts),
    profileRoundsCount,
  };
  const timeItem = {
    itemType: AUTO_SCHEDULING_AUDIT,
    itemValue,
  };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    addTournamentTimeItem({ tournamentRecord, timeItem });
  }
}
