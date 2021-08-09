import { validTimeString } from '../../../fixtures/validations/regex';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getVenuesAndCourts } from '../../getters/venueGetter';
import { getDrawDefinition } from '../../getters/eventGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string[]} matchUpIds - array of matchUpIds to be scheduled
 *
 */
export function bulkRescheduleMatchUps({
  tournamentRecord,
  matchUpIds,
  scheduleChange,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };
  if (typeof scheduleChange !== 'object') return { error: INVALID_VALUES };

  const { timeDifference, daysDifference } = scheduleChange;
  if (timeDifference && !validTimeString(timeDifference))
    return { error: INVALID_VALUES };
  if (daysDifference && !isNaN(daysDifference))
    return { error: INVALID_VALUES };

  const { matchUps, error } = allTournamentMatchUps({
    tournamentRecord,
    matchUpFilters: { matchUpIds },
  });
  if (error) return { error };

  const scheduleAttributes = ['scheduledDate', 'scheduledTime'];
  const hasSchedule = ({ schedule }) => {
    const matchUpScheduleKeys = Object.keys(schedule)
      .filter((key) => scheduleAttributes.includes(key))
      .filter((key) => schedule[key]);
    return !!matchUpScheduleKeys.length;
  };

  // return success if there are no scheduled matchUps to reschedule
  const scheduledMatchUps = matchUps.filter(hasSchedule);
  if (!scheduledMatchUps.length) return { ...SUCCESS };

  const { courts } = getVenuesAndCourts({ tournamentRecord });
  console.log(courts.length);

  // first organize matchUpIds by drawId
  const drawIdMap = scheduledMatchUps.reduce((drawIdMap, matchUp) => {
    const { matchUpId, drawId } = matchUp;
    if (drawIdMap[drawId]) {
      drawIdMap[drawId].push(matchUpId);
    } else {
      drawIdMap[drawId] = [matchUpId];
    }
    return drawIdMap;
  }, {});

  for (const drawId of Object.keys(drawIdMap)) {
    const { drawDefinition, error } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });
    if (error) return { error };
    const drawMatchUpIds = drawIdMap[drawId].filter((matchUpId) =>
      matchUpIds.includes(matchUpId)
    );
    for (const matchUpId of drawMatchUpIds) {
      if (matchUpId && drawDefinition) {
        //
      }
      /*
        if (scheduledTime !== undefined) {
          const result = addMatchUpScheduledTime({
            drawDefinition,
            matchUpId,
            scheduledTime,
          });
        }
        if (scheduledDate !== undefined) {
          const result = addMatchUpScheduledDate({
            drawDefinition,
            matchUpId,
            scheduledDate,
          });
        }
	*/
    }
  }

  return { ...SUCCESS };
}
