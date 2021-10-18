import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

export function modifyRoundRobinMatchUpsStatus({
  positionAssignments,
  drawDefinition,
  matchUpsMap,
  structure,
}) {
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    matchUpsMap,
    structure,
  });

  matchUps.forEach((matchUp) => {
    const matchUpAssignments = positionAssignments.filter(({ drawPosition }) =>
      matchUp.drawPositions?.includes(drawPosition)
    );
    const matchUpContainsBye = matchUpAssignments.filter(
      (assignment) => assignment.bye
    ).length;

    if (!matchUp.winningSide) {
      const matchUpStatus = matchUpContainsBye ? BYE : TO_BE_PLAYED;

      Object.assign(matchUp, { matchUpStatus });
      modifyMatchUpNotice({ drawDefinition, matchUp });
    }
  });
}
