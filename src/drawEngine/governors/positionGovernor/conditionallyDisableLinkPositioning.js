import {
  addExtension,
  removeExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { getPositionAssignments } from '../../getters/positionsGetter';

import { DISABLE_LINKS } from '../../../constants/extensionConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';

export function conditionallyDisableLinkPositioning({
  drawPositions,
  structure,
}) {
  if (
    [QUALIFYING, MAIN].includes(structure.stage) &&
    structure.stageSequence === 1
  ) {
    // positionActions are not disabled for first stage QUALIFYING and MAIN structures
    return;
  }
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

// NOT READY TO USE
export function reEnableDrawPositionLinks({ drawPosition, structure }) {
  const { positionAssignments } = getPositionAssignments({ structure });
  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  // only remove disabling extension if the position is unassigned
  // AND the source position has not yet attempted particpant traversal
  const { participantId, bye, qualifier } = assignment || {};
  if (!participantId && !bye && !qualifier) {
    removeExtension({ element: assignment, name: DISABLE_LINKS });
  }
}
