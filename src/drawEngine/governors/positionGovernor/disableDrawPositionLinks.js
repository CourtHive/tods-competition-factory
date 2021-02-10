import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { getPositionAssignments } from '../../getters/positionsGetter';

import { DISABLE_LINKS } from '../../../constants/extensionConstants';

export function disableDrawPositionLinks({ drawPositions, structure }) {
  const { positionAssignments } = getPositionAssignments({ structure });
  const relevantAssignments = positionAssignments.filter(({ drawPosition }) =>
    drawPositions.includes(drawPosition)
  );
  relevantAssignments.forEach((assignment) => {
    const extension = {
      name: DISABLE_LINKS,
      value: true,
    };
    addExtension({ element: assignment, extension });
  });
}
