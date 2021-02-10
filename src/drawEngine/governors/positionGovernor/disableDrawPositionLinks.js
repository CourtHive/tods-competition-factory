import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { getPositionAssignments } from '../../getters/positionsGetter';

export function disableDrawPositionLinks({ drawPositions, structure }) {
  const { positionAssignments } = getPositionAssignments({ structure });
  const relevantAssignments = positionAssignments.filter(({ drawPosition }) =>
    drawPositions.includes(drawPosition)
  );
  relevantAssignments.forEach((assignment) => {
    const extension = {
      name: 'disableLinks',
      value: true,
    };
    addExtension({ element: assignment, extension });
  });
}
