import { checkParticipantProfileInitialization } from './checkParticipantProfileInitialization';
import {
  addMinutesToTimeString,
  extractTime,
  minutesDifference,
  timeToDate,
} from '../../../../utilities/dateTime';
import { hasScheduleOverlap } from './hasScheduleOverlap';

export function checkRecoveryTime({
  individualParticipantProfiles,
  matchUpNotBeforeTimes,
  matchUpDependencies,
  scheduleTime,
  matchUp,
  details,
}) {
  const participantIdDependencies = (
    matchUpDependencies?.[matchUp.matchUpId]?.participantIds || []
  ).flat();

  const averageMatchUpMinutes =
    details?.minutesMap?.[matchUp.matchUpId]?.averageMinutes || 0;
  const recoveryMinutes =
    details?.minutesMap?.[matchUp.matchUpId]?.recoveryMinutes || 0;

  const sufficientTimeForIndiiduals = participantIdDependencies.every(
    (participantId) => {
      checkParticipantProfileInitialization({
        individualParticipantProfiles,
        participantId,
      });

      let profile = individualParticipantProfiles[participantId];
      if (!profile.timeAfterRecovery) return true;

      // check the timeAfterRecovery of potential matchUps in OTHER draws
      // ... timeAfterRecovery of potential matchUps in same draw are not considered
      const potentialRecoveryDateTime = Math.max(
        ...Object.keys(profile.potentialRecovery)
          .filter((drawId) => drawId !== matchUp.drawId)
          .map((drawId) => {
            const drawPotentials = profile.potentialRecovery[drawId] || [];
            if (!Array.isArray(drawPotentials)) return 0;
            return Math.max(...drawPotentials.map(timeToDate), 0);
          }),
        0
      );

      const dateTimeAfterRecovery = timeToDate(profile.timeAfterRecovery);
      const comparisonDateTime = potentialRecoveryDateTime
        ? Math.max(potentialRecoveryDateTime, dateTimeAfterRecovery)
        : dateTimeAfterRecovery;

      const timeBetween = minutesDifference(
        comparisonDateTime,
        timeToDate(scheduleTime),
        false
      );

      // details are provided by jinnScheduler and this enables treating a participant's scheduled matchUps as "bookings"
      if (details && timeBetween < 0) {
        const endTime = extractTime(matchUp?.schedule?.endTime);
        const timeAfterRecovery = endTime
          ? addMinutesToTimeString(endTime, parseInt(recoveryMinutes))
          : addMinutesToTimeString(
              scheduleTime,
              parseInt(averageMatchUpMinutes) + parseInt(recoveryMinutes)
            );

        const potentialParticipantBookings = Object.keys(
          profile.potentialBookings
        )
          .filter((drawId) => drawId !== matchUp.drawId)
          .map((drawId) => profile.potentialBookings[drawId])
          .flat();

        const participantBookings = [
          ...potentialParticipantBookings,
          ...profile.bookings,
        ];

        const timeOverlap = !!participantBookings.find((booking) => {
          return hasScheduleOverlap(
            { scheduleTime, timeAfterRecovery },
            booking
          );
        });

        return !timeOverlap;
      }

      return timeBetween < 0 ? false : true;
    }
  );

  const notBeforeTime = matchUpNotBeforeTimes[matchUp.matchUpId];
  const timeBetweenMatchUps = notBeforeTime
    ? minutesDifference(
        timeToDate(notBeforeTime),
        timeToDate(scheduleTime),
        false
      )
    : 0;
  const sufficientTimeBetweenMatchUps = timeBetweenMatchUps >= 0;

  const enoughTime =
    sufficientTimeForIndiiduals && sufficientTimeBetweenMatchUps;

  return { enoughTime };
}
