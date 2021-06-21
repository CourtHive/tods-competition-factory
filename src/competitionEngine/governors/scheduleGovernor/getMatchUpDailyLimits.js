import { getMatchUpDailyLimits as getDailyLimit } from '../../../tournamentEngine/governors/scheduleGovernor/getMatchUpDailyLimits';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object[]} tournamentRecords - auto populated by competitionEngine
 * @param {string} tournamentId - optional - narrow search to specific tournamentRecord
 *
 * @returns
 */
export function getMatchUpDailyLimits({ tournamentRecords, tournamentId }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || currentTournamentId === tournamentId
  );

  let dailyLimits;
  tournamentIds.find((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];

    const { matchUpDailyLimits } = getDailyLimit({
      tournamentRecord,
    });
    dailyLimits = matchUpDailyLimits;
    return true;
  });

  return { matchUpDailyLimits: dailyLimits };
}
