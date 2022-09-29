import { modifyCourt as courtModification } from '../../../tournamentEngine/governors/venueGovernor/modifyCourt';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyCourt({
  tournamentRecords,
  modifications,
  disableNotice,
  courtId,
  force,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  let courtModified;
  let error;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = courtModification({
      tournamentRecord,
      modifications,
      disableNotice,
      courtId,
      force,
    });
    if (result?.error) error = result;

    courtModified = true;
  }

  return courtModified ? { ...SUCCESS } : error;
}
