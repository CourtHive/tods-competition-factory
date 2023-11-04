import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { addMatchUpScheduleItems } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../../global/functions/deducers/getDrawDefinition';
import {
  allDrawMatchUps,
  allTournamentMatchUps,
} from '../../getters/matchUpsGetter/matchUpsGetter';

import { Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_SCHEDULE,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
  ErrorType,
} from '../../../constants/errorConditionConstants';

type BulkScheduleMachUpsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  errorOnAnachronism?: boolean;
  tournamentRecord: Tournament;
  checkChronology?: boolean;
  matchUpDependencies?: any;
  matchUpIds?: string[];
  matchUpDetails?: any;
  schedule?: any;
};

export function bulkScheduleMatchUps({
  errorOnAnachronism = false,
  checkChronology = true,
  matchUpDependencies,
  tournamentRecords,
  tournamentRecord,
  matchUpDetails,
  matchUpIds,
  schedule,
}: BulkScheduleMachUpsArgs): {
  error?: ErrorType;
  scheduled?: number;
  warnings?: any[];
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpDetails && (!matchUpIds || !Array.isArray(matchUpIds)))
    return { error: MISSING_MATCHUP_IDS };

  if (!matchUpDetails && (!schedule || typeof schedule !== 'object'))
    return { error: MISSING_SCHEDULE };

  let inContextMatchUps;
  const warnings: any[] = [];
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
      })?.matchUps ?? [];
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
    if (!drawDefinition) continue;

    const drawMatchUpIds = drawIdMap[drawId].filter(
      (matchUpId) =>
        matchUpIds?.includes(matchUpId) ?? detailMatchUpIds?.includes(matchUpId)
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
      if (result?.warnings?.length) warnings.push(...result.warnings);
      if (result?.success) scheduled += 1;
      if (result.error) return result;
    }
  }

  return warnings.length
    ? { ...SUCCESS, scheduled, warnings }
    : { ...SUCCESS, scheduled };
}
