import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { addNotice } from '../../../global/globalState';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';

export function modifyRoundRobinMatchUpsStatus({
  positionAssignments,
  drawDefinition,
  structure,
}) {
  const { matchUps } = getAllStructureMatchUps({ drawDefinition, structure });

  matchUps.forEach((matchUp) => {
    const matchUpAssignments = positionAssignments.filter(({ drawPosition }) =>
      matchUp.drawPositions.includes(drawPosition)
    );
    const matchUpContainsBye = matchUpAssignments.filter(
      (assignment) => assignment.bye
    ).length;

    if (!matchUp.winningSide) {
      const matchUpStatus = matchUpContainsBye ? BYE : TO_BE_PLAYED;

      Object.assign(matchUp, { matchUpStatus });
      addNotice({
        topic: MODIFY_MATCHUP,
        payload: { matchUp },
      });
    }
  });
}
