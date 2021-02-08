import { addMatchUpScheduledTime } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getVenuesAndCourts } from '../../../competitionEngine/getters/venuesAndCourtsGetter';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import {
  timeToDate,
  matchUpTiming,
} from '../../../competitionEngine/governors/scheduleGovernor/garman/garman';

import {
  BYE,
  ABANDONED,
  DEFAULTED,
  RETIRED,
  WALKOVER,
  COMPLETED,
} from '../../../constants/matchUpStatusConstants';
import { MISSING_TOURNAMENT_ID } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function scheduleMatchUps(props) {
  const {
    tournamentRecords,

    venueIds,
    matchUps,
    date,

    periodLength = 30,
    averageMatchUpTime = 90,
  } = props;

  let { startTime, endTime } = props;

  const { courts: allCourts } = getVenuesAndCourts({ tournamentRecords });
  const courts = allCourts.filter(
    (court) => !venueIds || venueIds.includes(court.venueId)
  );

  if (!startTime) {
    startTime = courts.reduce((minStartTime, court) => {
      return new Date(court.startTime) > new Date(minStartTime)
        ? court.startTime
        : minStartTime;
    }, undefined);
  }

  if (!endTime) {
    endTime = courts.reduce((maxEndTime, court) => {
      return new Date(court.endTime) > new Date(maxEndTime)
        ? court.endTime
        : maxEndTime;
    }, undefined);
  }

  const timingParameters = {
    date,
    courts,
    startTime,
    endTime,
    periodLength,
    averageMatchUpTime,
  };
  const { scheduleTimes } = matchUpTiming(timingParameters);

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

  // TODO: can be optimized by aggregating all matchUpIds to be scheduled for a particular drawDefinition
  if (matchUpsToSchedule?.length) {
    matchUpsToSchedule.forEach((targetMatchUp) => {
      const { drawId, matchUpId, tournamentId } = targetMatchUp;
      const tournamentRecord = tournamentRecords[tournamentId];
      if (tournamentRecord) {
        const { drawDefinition } = getDrawDefinition({
          tournamentRecord,
          drawId,
        });

        if (drawDefinition && scheduleTimes.length) {
          const { scheduleTime } = scheduleTimes.shift();

          // must include date being scheduled to generate proper ISO string
          const scheduledTime = new Date(
            timeToDate(scheduleTime, date)
          ).toISOString();

          addMatchUpScheduledTime({ drawDefinition, matchUpId, scheduledTime });
        }
      } else {
        console.log(MISSING_TOURNAMENT_ID);
      }
    });
  }

  return SUCCESS;
}
