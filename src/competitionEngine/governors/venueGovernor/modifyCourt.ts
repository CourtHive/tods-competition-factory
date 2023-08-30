import { modifyCourt as courtModification } from '../../../tournamentEngine/governors/venueGovernor/modifyCourt';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { Tournament } from '../../../types/tournamentFromSchema';

type ModifyCourtArgs = {
  tournamentRecords: { [key: string]: Tournament };
  disableNotice?: boolean;
  modifications: any;
  courtId: string;
  force?: boolean;
};

export function modifyCourt({
  tournamentRecords,
  disableNotice,
  modifications,
  courtId,
  force,
}: ModifyCourtArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!courtId) return { error: MISSING_VALUE, info: 'missing courtId' };

  let courtModified;
  let error;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = courtModification({
      tournamentRecord,
      disableNotice,
      modifications,
      courtId,
      force,
    });
    if (result?.error) error = result;

    courtModified = true;
  }

  return courtModified ? { ...SUCCESS } : error;
}
