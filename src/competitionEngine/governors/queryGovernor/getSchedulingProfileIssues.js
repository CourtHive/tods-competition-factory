import { getScheduledRoundsDetails } from '../scheduleGovernor/schedulingProfile/getScheduledRoundsDetails';
import { getMatchUpDependencies } from '../scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getSchedulingProfile } from '../scheduleGovernor/schedulingProfile/schedulingProfile';
import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import { isValidDateString } from '../../../utilities/dateTime';
import { intersection, unique } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DATE,
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecords
 * @param {string[]} scheduleDates - optional - array of scheduleDates to validate
 */
export function getSchedulingProfileIssues({
  tournamentRecords,
  scheduleDates = [],
} = {}) {
  if (typeof tournamentRecords !== 'object')
    return { error: INVALID_TOURNAMENT_RECORD };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const validDates = scheduleDates.every(isValidDateString);
  if (!validDates) return { error: INVALID_DATE };

  const issues = [];
  const roundIndexShouldBeAfter = {};

  const { schedulingProfile } = getSchedulingProfile({ tournamentRecords });
  if (!schedulingProfile) return { issues, ...SUCCESS };

  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    nextMatchUps: true,
  });

  const periodLength = 30;

  // for each date check the rounds for each venue
  for (const dateProfile of schedulingProfile) {
    const { scheduleDate, venues = [] } = dateProfile;

    // skip scheduleDates that are not specified; process all if none specified
    if (!scheduleDates?.length || scheduleDates.includes(scheduleDate)) {
      for (const venue of venues || []) {
        if (venue) {
          const { rounds } = venue;
          const schedulingErrors = [];
          let { orderedMatchUpIds, scheduledRoundsDetails } =
            getScheduledRoundsDetails({
              tournamentRecords,
              periodLength,
              matchUps,
              rounds,
            });
          const { matchUpDependencies } = getMatchUpDependencies({
            tournamentRecords,
            matchUps,
          });
          const getRoundIndex = (matchUpId) => {
            let roundIndex;
            scheduledRoundsDetails.find((round, index) => {
              const includes = round.matchUpIds.includes(matchUpId);
              if (includes) roundIndex = index;
              return includes;
            });
            return roundIndex;
          };

          orderedMatchUpIds.forEach((matchUpId, index) => {
            const followingMatchUpIds = orderedMatchUpIds.slice(index + 1);
            const shouldBeAfter = intersection(
              followingMatchUpIds,
              matchUpDependencies?.[matchUpId]?.matchUpIds || []
            );
            if (shouldBeAfter.length)
              schedulingErrors.push({ matchUpId, shouldBeAfter });
          });
          if (schedulingErrors.length) {
            const errorsDetail = schedulingErrors.map(
              ({ matchUpId, shouldBeAfter }) => {
                const matchUpRoundIndex = getRoundIndex(matchUpId);
                const earlierRoundIndices = unique(
                  shouldBeAfter.map(getRoundIndex)
                );

                if (!roundIndexShouldBeAfter[scheduleDate]) {
                  roundIndexShouldBeAfter[scheduleDate] = {};
                }
                if (!roundIndexShouldBeAfter[scheduleDate][matchUpRoundIndex])
                  roundIndexShouldBeAfter[scheduleDate][matchUpRoundIndex] = [];
                earlierRoundIndices.forEach((index) => {
                  if (
                    !roundIndexShouldBeAfter[scheduleDate][
                      matchUpRoundIndex
                    ].includes(index)
                  ) {
                    roundIndexShouldBeAfter[scheduleDate][
                      matchUpRoundIndex
                    ].push(index);
                  }
                });

                return {
                  matchUpId,
                  matchUpRoundIndex,
                  earlierRoundIndices,
                  shouldBeAfter,
                };
              }
            );

            issues.push(...errorsDetail);
          }
        }
      }
    }
  }

  const profileIssues = {
    matchUpIdShouldBeAfter: Object.assign(
      {},
      ...issues.map((issue) => {
        const { matchUpId, shouldBeAfter, earlierRoundIndices } = issue;
        return {
          [matchUpId]: { earlierRoundIndices, shouldBeAfter },
        };
      })
    ),
  };

  return { profileIssues, roundIndexShouldBeAfter, ...SUCCESS };
}
