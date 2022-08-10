import { getSchedulingProfile } from './schedulingProfile';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function getRounds({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const rounds = [];
  const { schedulingProfile } = getSchedulingProfile({ tournamentRecords });
  console.log({ schedulingProfile });

  return { ...SUCCESS, rounds };
}
