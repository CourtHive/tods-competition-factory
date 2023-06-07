import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { addMatchUpScheduleItems } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getDrawDefinition } from '../../getters/eventGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_SCHEDULE,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string[]} matchUpIds - array of matchUpIds to be scheduled
 * @param {object} schedule - { venueId?: string; scheduledDate?: string; scheduledTime?: string }
 *
 */
export function bulkScheduleMatchUps({
  errorOnAnachronism = false,
  checkChronology = true,
  matchUpDependencies,
  tournamentRecords,
  tournamentRecord,
  matchUpDetails,
  matchUpIds,
  schedule,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpDetails && (!matchUpIds || !Array.isArray(matchUpIds)))
    return { error: MISSING_MATCHUP_IDS };

  if (!matchUpDetails && (!schedule || typeof schedule !== 'object'))
    return { error: MISSING_SCHEDULE };

  const warnings = [];
  let scheduled = 0;

  matchUpDependencies =
    checkChronology &&
    (matchUpDependencies ||
      getMatchUpDependencies({
        tournamentRecords,
      }).matchUpDependencies);

  const { matchUps } = allTournamentMatchUps({ tournamentRecord });

  // first organize matchUpIds by drawId
  const drawIdMap = matchUps.reduce((drawIdMap, matchUp) => {
    const { matchUpId, drawId } = matchUp;
    if (drawIdMap[drawId]) {
      drawIdMap[drawId].push(matchUpId);
    } else {
      drawIdMap[drawId] = [matchUpId];
    }
    return drawIdMap;
  }, {});

  const detailMatchUpIds = matchUpDetails?.map((detail) => detail.matchUpId);

  for (const drawId of Object.keys(drawIdMap)) {
    const { drawDefinition } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });
    const drawMatchUpIds = drawIdMap[drawId].filter(
      (matchUpId) =>
        matchUpIds?.includes(matchUpId) || detailMatchUpIds?.includes(matchUpId)
    );

    for (const matchUpId of drawMatchUpIds) {
      const matchUpSchedule =
        matchUpDetails?.find((details) => details.matchUpId === matchUpId)
          ?.schedule || schedule;
      const result = addMatchUpScheduleItems({
        schedule: matchUpSchedule,
        matchUpDependencies,
        errorOnAnachronism,
        tournamentRecords,
        tournamentRecord,
        checkChronology,
        drawDefinition,
        matchUpId,
        matchUps,
      });
      if (result.warnings?.length) warnings.push(...result.warnings);
      if (result.success) scheduled += 1;
      if (result.error) return result;
    }
  }

  return warnings.length
    ? { ...SUCCESS, scheduled, warnings }
    : { ...SUCCESS, scheduled };
}
