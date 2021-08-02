import { getRoundRobinGroupMatchUps } from '../../../generators/roundRobinGroups';
import { overlap } from '../../../../utilities/arrays';

export function getAvoidanceConflicts({ isRoundRobin, groupedParticipants }) {
  const avoidanceConflicts = [];
  if (isRoundRobin) {
    groupedParticipants.forEach((participantGroup) => {
      const drawPositions = participantGroup.map(
        (participant) => participant.drawPosition
      );
      const { uniqueMatchUpGroupings } = getRoundRobinGroupMatchUps({
        drawPositions,
      });
      const drawPositionValuesMap = Object.assign(
        {},
        ...participantGroup.map((participant) => ({
          [participant.drawPosition]: participant,
        }))
      );
      uniqueMatchUpGroupings.forEach((grouping) => {
        const avoidanceConflict = overlap(
          drawPositionValuesMap[grouping[0]].values || [],
          drawPositionValuesMap[grouping[1]].values || []
        );

        if (avoidanceConflict) {
          avoidanceConflicts.push(grouping);
          participantGroup.conflict = true;
        }
      });
    });
  } else {
    groupedParticipants.forEach((matchUpPair) => {
      const avoidanceConflict = overlap(
        matchUpPair[0].values || [],
        matchUpPair[1].values || []
      );

      if (avoidanceConflict) {
        avoidanceConflicts.push(matchUpPair);
        matchUpPair.conflict = true;
      }
    });
  }

  return avoidanceConflicts;
}
