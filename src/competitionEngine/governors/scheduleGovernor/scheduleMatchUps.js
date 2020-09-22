import {
  timeToDate,
  matchUpTiming,
} from '../../../competitionEngine/governors/scheduleGovernor/garman/garman';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { getVenuesAndCourts } from '../../../competitionEngine/getters/venuesAndCourtsGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function scheduleMatchUps(props) {
  const {
    tournamentRecords,
    drawEngine,

    venueIds,
    matchUps,
    date,

    periodLength = 30,
    averageMatchTime = 90,
  } = props;

  let { startTime, endTime } = props;

  const { courts: allCourts } = getVenuesAndCourts({ tournamentRecords });
  const courts = allCourts.filter(
    court => !venueIds || venueIds.includes(court.venueId)
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
    averageMatchTime,
  };
  const { scheduleTimes } = matchUpTiming(timingParameters);

  // TODO: can be optimized by aggregating all matchUpIds to be scheduled for a particular drawDefinition
  if (matchUps?.length) {
    matchUps.forEach(targetMatchUp => {
      const { drawId, matchUpId, tournamentId } = targetMatchUp;
      const tournamentRecord = tournamentRecords[tournamentId];
      if (tournamentRecord) {
        const { drawDefinition, event } = getDrawDefinition({
          tournamentRecord,
          drawId,
        });

        if (drawDefinition && scheduleTimes.length) {
          const { scheduleTime } = scheduleTimes.shift();

          // must include date being scheduled to generate proper ISO string
          const scheduledTime = new Date(
            timeToDate(scheduleTime, date)
          ).toISOString();

          drawEngine
            .setState(drawDefinition)
            .addMatchUpScheduledTime({ matchUpId, scheduledTime });

          const {
            drawDefinition: updatedDrawDefinition,
          } = drawEngine.getState();

          event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
            return drawDefinition.drawId === drawId
              ? updatedDrawDefinition
              : drawDefinition;
          });
        }
      } else {
        console.log('missing tournamentId');
      }
    });
  }

  return SUCCESS;
}
