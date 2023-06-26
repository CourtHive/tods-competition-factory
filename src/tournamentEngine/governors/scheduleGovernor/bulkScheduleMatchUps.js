import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { addMatchUpScheduleItems } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import {
  allDrawMatchUps,
  allTournamentMatchUps,
} from '../../getters/matchUpsGetter';
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

  let inContextMatchUps;
  const warnings = [];
  let scheduled = 0;

  // Optimize getting matchUps for all tournamentRecords
  // if matchUpDependencies are provided, skip this step
  if (checkChronology && !matchUpDependencies) {
    const result = getMatchUpDependencies({ tournamentRecords });
    matchUpDependencies = result.matchUpDependencies;
    inContextMatchUps = result.matchUps;
  }

  // Optimize getting matchUps for all tournamentRecords
  // if inContextMatchUps retrieved in previous step, skip this step
  if (!inContextMatchUps) {
    inContextMatchUps =
      allTournamentMatchUps({
        tournamentRecord,
      })?.matchUps || [];
  }

  // first organize matchUpIds by drawId
  const drawIdMap = inContextMatchUps.reduce((drawIdMap, matchUp) => {
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

    // optimize matchUp retrieval
    const drawMatchUps = allDrawMatchUps({
      inContext: false,
      drawDefinition,
    }).matchUps;

    for (const matchUpId of drawMatchUpIds) {
      const matchUpSchedule =
        matchUpDetails?.find((details) => details.matchUpId === matchUpId)
          ?.schedule || schedule;
      const result = addMatchUpScheduleItems({
        schedule: matchUpSchedule,
        matchUpDependencies,
        errorOnAnachronism,
        inContextMatchUps,
        tournamentRecords,
        tournamentRecord,
        checkChronology,
        drawDefinition,
        drawMatchUps,
        matchUpId,
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
