import { checkParticipantProfileInitialization } from './checkParticipantProfileInitialization';
import { minutesDifference, timeToDate } from '../../../../utilities/dateTime';

export function checkRecoveryTime({
  individualParticipantProfiles,
  matchUpNotBeforeTimes,
  matchUpDependencies,
  scheduleTime,
  matchUp,
}) {
  const participantIdDependencies = (
    matchUpDependencies?.[matchUp.matchUpId]?.participantIds || []
  ).flat();
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
            if (!Array.isArray(drawPotentials)) {
              console.log({ drawPotentials });
              return 0;
            }
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
