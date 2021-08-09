import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getDrawDefinition } from '../../getters/eventGetter';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import {
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
} from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';

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
  tournamentRecord,
  matchUpIds,
  schedule,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };

  if (!schedule || typeof schedule !== 'object')
    return { error: MISSING_SCHEDULE };

  const { matchUps, error } = allTournamentMatchUps({ tournamentRecord });
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

  const { venueId, scheduledDate, scheduledTime } = schedule;

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
      if (scheduledTime !== undefined) {
        const result = addMatchUpScheduledTime({
          drawDefinition,
          matchUpId,
          scheduledTime,
        });
        if (result.error) return { error: result.error, scheduledTime };
      }
      if (scheduledDate !== undefined) {
        const result = addMatchUpScheduledDate({
          drawDefinition,
          matchUpId,
          scheduledDate,
        });
        if (result.error) return { error: result.error, scheduledDate };
      }
      if (venueId !== undefined) {
        const result = assignMatchUpVenue({
          tournamentRecord,
          drawDefinition,
          matchUpId,
          venueId,
        });
        if (result.error) return { error: result.error, venueId };
      }
    }
  }

  return { ...SUCCESS };
}
