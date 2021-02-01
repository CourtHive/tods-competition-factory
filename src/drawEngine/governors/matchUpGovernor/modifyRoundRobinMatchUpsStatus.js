import { addNotice } from '../../../global/globalState';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

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

    const matchUpStatus = matchUpContainsBye ? BYE : TO_BE_PLAYED;

    Object.assign(matchUp, { matchUpStatus });
    addNotice({
      topic: 'modifyMatchUp',
      payload: { matchUp },
    });
  });
}
