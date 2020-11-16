import { intersection } from '../../../../utilities/arrays';

import { getRoundRobinGroupMatchUps } from '../../../generators/roundRobinGroups';

export function getAvoidanceConflicts({ isRoundRobin, groupedParticipants }) {
  const avoidanceConflicts = [];
  if (isRoundRobin) {
    groupedParticipants.forEach(participantGroup => {
      const drawPositions = participantGroup.map(
        participant => participant.drawPosition
      );
      const { uniqueMatchUpGroupings } = getRoundRobinGroupMatchUps({
        drawPositions,
      });
      const drawPositionValuesMap = Object.assign(
        {},
        ...participantGroup.map(participant => ({
          [participant.drawPosition]: participant,
        }))
      );
      uniqueMatchUpGroupings.forEach(grouping => {
        const avoidanceConflict = intersection(
          drawPositionValuesMap[grouping[0]].values || [],
          drawPositionValuesMap[grouping[1]].values || []
        ).length;

        if (avoidanceConflict) {
          avoidanceConflicts.push(grouping);
          participantGroup.conflict = true;
        }
      });
    });
  } else {
    groupedParticipants.forEach(matchUpPair => {
      const avoidanceConflict = intersection(
        matchUpPair[0].values || [],
        matchUpPair[1].values || []
      ).length;

      if (avoidanceConflict) {
        avoidanceConflicts.push(matchUpPair);
        matchUpPair.conflict = true;
      }
    });
  }

  return avoidanceConflicts;
}
