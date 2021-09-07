import { getScheduledRoundsDetails } from '../scheduleGovernor/schedulingProfile/getScheduledRoundsDetails';
import { getMatchUpDependencies } from '../scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getSchedulingProfile } from '../scheduleGovernor/schedulingProfile/schedulingProfile';
import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import { intersection } from '../../../utilities';

import { INVALID_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 *
 * @param {object} tournamentRecords
 * @param {string[]} dates - optional - array of dates to validate
 */
export function getSchedulingProfileIssues({ tournamentRecords, dates = [] }) {
  if (typeof tournamentRecords !== 'object')
    return { error: INVALID_TOURNAMENT_RECORD };
  const issues = [];

  const { schedulingProfile } = getSchedulingProfile({ tournamentRecords });

  if (!schedulingProfile) return { issues, ...SUCCESS };

  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    nextMatchUps: true,
  });

  const periodLength = 30;

  // for each date check the rounds for each venue
  for (const dateProfile of schedulingProfile) {
    const { date, venues = [] } = dateProfile;

    // skip dates that are not specified; process all if none specified
    if (!dates?.length || dates.includes(date)) {
      for (const venue of venues || []) {
        const schedulingErrors = [];
        if (venue) {
          const { rounds } = venue;
          let { orderedMatchUpIds } = getScheduledRoundsDetails({
            tournamentRecords,
            periodLength,
            matchUps,
            rounds,
          });
          const { matchUpDependencies } = getMatchUpDependencies({ matchUps });

          orderedMatchUpIds.forEach((matchUpId, index) => {
            const followingMatchUpIds = orderedMatchUpIds.slice(index + 1);
            const orderErrors = intersection(
              followingMatchUpIds,
              matchUpDependencies[matchUpId]
            );
            if (orderErrors.length)
              schedulingErrors.push({ [matchUpId]: orderErrors });
          });
        }
        if (schedulingErrors.length) issues.push(...schedulingErrors);
      }
    }
  }

  return { issues, ...SUCCESS };
}
