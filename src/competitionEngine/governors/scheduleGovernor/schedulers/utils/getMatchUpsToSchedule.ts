import { processNextMatchUps } from '../../scheduleMatchUps/processNextMatchUps';

import {
  BYE,
  ABANDONED,
  DEFAULTED,
  RETIRED,
  WALKOVER,
  COMPLETED,
  DOUBLE_WALKOVER,
  DOUBLE_DEFAULT,
} from '../../../../../constants/matchUpStatusConstants';

export function getMatchUpsToSchedule({
  matchUpPotentialParticipantIds,
  scheduleCompletedMatchUps,
  dateScheduledMatchUpIds,
  matchUpNotBeforeTimes,
  orderedMatchUpIds,
  clearDate,
  matchUps,
}) {
  // this must be done to preserve the order of matchUpIds
  const matchUpsToSchedule = orderedMatchUpIds
    .map((matchUpId) =>
      matchUps.find((matchUp) => matchUp.matchUpId === matchUpId)
    )
    .filter(Boolean)
    .filter((matchUp) => {
      const alreadyScheduled =
        !clearDate && dateScheduledMatchUpIds.includes(matchUp.matchUpId);

      const doNotSchedule = [
        BYE,
        DEFAULTED,
        COMPLETED,
        ABANDONED,
        RETIRED,
        WALKOVER,
        DOUBLE_WALKOVER,
        DOUBLE_DEFAULT,
      ].includes(matchUp?.matchUpStatus);

      return (
        scheduleCompletedMatchUps || // override for mocksEngine
        (!alreadyScheduled && !matchUp.winningSide && !doNotSchedule)
      );
    });

  // for optimization, build up an object for each tournament and an array for each draw with target matchUps
  // keep track of matchUps counts per participant and don't add matchUps for participants beyond those limits
  const { matchUpMap } = matchUpsToSchedule.reduce(
    (aggregator, matchUp) => {
      const { drawId, tournamentId } = matchUp;

      if (!aggregator.matchUpMap[tournamentId])
        aggregator.matchUpMap[tournamentId] = {};
      if (!aggregator.matchUpMap[tournamentId][drawId]) {
        aggregator.matchUpMap[tournamentId][drawId] = [matchUp];
      } else {
        aggregator.matchUpMap[tournamentId][drawId].push(matchUp);
      }

      // since this matchUp is to be scheduled, update the matchUpPotentialParticipantIds
      processNextMatchUps({
        matchUpPotentialParticipantIds,
        matchUpNotBeforeTimes,
        matchUp,
      });

      return aggregator;
    },
    { matchUpMap: {} }
  );
  return { matchUpsToSchedule, matchUpMap };
}
