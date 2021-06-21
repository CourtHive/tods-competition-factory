import { getMatchUpFormatTimingUpdate as getUpdate } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTimingUpdate';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';

export function getMatchUpFormatTimingUpdate({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);

  const methods = tournamentIds
    .map((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const methods = getUpdate({ tournamentRecord })?.methods || [];
      return methods.length && { tournamentId, methods };
    })
    .filter((f) => f);

  return methods.length
    ? { methods: [{ method: 'tournamentMethods', params: { methods } }] }
    : { methods: [] };
}
