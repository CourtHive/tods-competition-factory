import { assignMatchUpVenue } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { addMatchUpScheduledTime } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import { calculateScheduleTimes } from './calculateScheduleTimes';
import { formatDate, zeroPad } from '../../../utilities/dateTime';

import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_TOURNAMENT_ID,
  MISSING_MATCHUP_IDS,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  ABANDONED,
  DEFAULTED,
  RETIRED,
  WALKOVER,
  COMPLETED,
} from '../../../constants/matchUpStatusConstants';

export function scheduleMatchUps(props) {
  const {
    tournamentRecords,
    matchUpIds,
    venueIds,

    date,
    periodLength = 30,
    averageMatchUpTime = 90,
  } = props;

  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!matchUpIds) return { error: MISSING_MATCHUP_IDS };

  let matchUps = props.matchUps;
  if (!matchUps) {
    const { matchUps: competitionMatchUps } = allCompetitionMatchUps({
      tournamentRecords,
    });
    matchUps = competitionMatchUps.filter(({ matchUpId }) =>
      matchUpIds.includes(matchUpId)
    );
  }

  let { startTime, endTime } = props;

  const { venueId, scheduleTimes } = calculateScheduleTimes({
    tournamentRecords,
    startTime,
    endTime,
    date,
    averageMatchUpTime,
    periodLength,
    venueIds,
  });

  // matchUps are assumed to be in the desired order for scheduling
  const matchUpsToSchedule = matchUps.filter((matchUp) => {
    const doNotSchedule = [
      BYE,
      DEFAULTED,
      COMPLETED,
      ABANDONED,
      RETIRED,
      WALKOVER,
    ].includes(matchUp?.matchUpStatus);
    return !matchUp?.winningSide && !doNotSchedule;
  });

  if (!matchUpsToSchedule?.length) return { error: 'Nothing to schedule' };
  if (!scheduleTimes?.length) return { error: 'No schedule times available' };

  // for optimization, build up an object for each tournament and an array for each draw with target matchUps
  const matchUpMap = matchUpsToSchedule.reduce((matchUpMap, matchUp) => {
    const { drawId, tournamentId } = matchUp;
    if (!matchUpMap[tournamentId]) matchUpMap[tournamentId] = {};
    if (!matchUpMap[tournamentId][drawId]) {
      matchUpMap[tournamentId][drawId] = [matchUp];
    } else {
      matchUpMap[tournamentId][drawId].push(matchUp);
    }
    return matchUpMap;
  }, {});

  const matchUpScheduleTimes = Object.assign(
    {},
    ...matchUpsToSchedule
      .slice(0, scheduleTimes.length)
      .map(({ matchUpId }) => {
        const { scheduleTime } = scheduleTimes.shift();
        return { [matchUpId]: scheduleTime };
      })
  );

  let scheduledMatchUpIds = [];
  Object.keys(matchUpMap).forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    if (tournamentRecord) {
      Object.keys(matchUpMap[tournamentId]).forEach((drawId) => {
        const { drawDefinition } = getDrawDefinition({
          tournamentRecord,
          drawId,
        });
        if (drawDefinition) {
          const drawMatchUps = matchUpMap[tournamentId][drawId];
          drawMatchUps.forEach(({ matchUpId }) => {
            const scheduleTime = matchUpScheduleTimes[matchUpId];
            if (scheduleTime) {
              // must include date being scheduled to generate proper ISO string
              const formatTime = scheduleTime.split(':').map(zeroPad).join(':');
              const scheduledTime = `${formatDate(date)}T${formatTime}`;

              const result = addMatchUpScheduledTime({
                drawDefinition,
                matchUpId,
                scheduledTime,
              });
              if (result.success)
                scheduledMatchUpIds.push({ matchUpId, scheduleTime });

              if (venueId) {
                assignMatchUpVenue({
                  tournamentRecord,
                  drawDefinition,
                  matchUpId,
                  venueId,
                });
              }
            }
          });
        }
      });
    } else {
      console.log(MISSING_TOURNAMENT_ID);
    }
  });

  return Object.assign({}, SUCCESS, { scheduledMatchUpIds });
}
