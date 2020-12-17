import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import {
  addMatchUpScheduledDayDate,
  addMatchUpScheduledTime,
} from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../getters/eventGetter';
import { assignMatchUpVenue } from './assignMatchUpVenue';

import {
  MISSING_SCHEDULE,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {object} drawEngine - passed in automatically by tournamentEngine
 * @param {string[]} matchUpIds - array of matchUpIds to be scheduled
 * @param {object} schedule - { venueId?: string; scheduledDayDate?: string; scheduledTime?: string }
 *
 */
export function bulkScheduleMatchUps({
  tournamentRecord,
  drawEngine,
  matchUpIds,
  schedule,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };

  if (!schedule || typeof schedule !== 'object')
    return { error: MISSING_SCHEDULE };

  const { matchUps, error } = allTournamentMatchUps({
    tournamentRecord,
    drawEngine,
  });
  if (error) return { error };

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

  const { venueId, scheduledDayDate, scheduledTime } = schedule;

  const errors = [];
  Object.keys(drawIdMap).forEach((drawId) => {
    const { drawDefinition, error } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });
    if (!error) {
      const drawMatchUpIds = drawIdMap[drawId].filter((matchUpId) =>
        matchUpIds.includes(matchUpId)
      );
      drawMatchUpIds.forEach((matchUpId) => {
        if (scheduledTime) {
          const result = addMatchUpScheduledTime({
            drawDefinition,
            matchUpId,
            scheduledTime,
          });
          if (result.error) errors.push({ error: result.error, scheduledTime });
        }
        if (scheduledDayDate) {
          const result = addMatchUpScheduledDayDate({
            drawDefinition,
            matchUpId,
            scheduledDayDate,
          });
          if (result.error)
            errors.push({ error: result.error, scheduledDayDate });
        }
        if (venueId) {
          const result = assignMatchUpVenue({
            tournamentRecord,
            drawDefinition,
            matchUpId,
            venueId,
          });
          if (result.error) errors.push({ error: result.error, venueId });
        }
      });
    }
  });

  return !errors.length ? SUCCESS : { error: INVALID_VALUES, errors };
}
