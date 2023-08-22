import { addExtension } from '../../../global/functions/producers/addExtension';
import { findExtension } from '../../../global/functions/deducers/findExtension';
import { getPositionAssignments } from '../../getters/positionsGetter';

import { AUDIT_POSITION_ACTIONS } from '../../../constants/extensionConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';

// updates 'positionActions' extension to keep track of positionActions by end-user
// TODO: consider adding timestamp attribute to positionAction object
export function addPositionActionTelemetry({ drawDefinition, positionAction }) {
  const { extension } = findExtension({
    name: AUDIT_POSITION_ACTIONS,
    element: drawDefinition,
  });

  const existingValue = Array.isArray(extension?.value) ? extension.value : [];

  if (!existingValue.length) {
    const mainStructure = drawDefinition.structures.find(
      (structure) => structure.stage === MAIN
    );
    if (mainStructure) {
      const initialAssignments = getPositionAssignments({
        structure: mainStructure,
      }).positionAssignments.map(
        ({ drawPosition, participantId, bye, qualifier }) => ({
          drawPosition,
          participantId,
          qualifier,
          bye,
        })
      );

      existingValue.push({
        name: 'initialMainAssignments',
        initialAssignments,
      });
    }
  }

  const updatedExtension = {
    name: AUDIT_POSITION_ACTIONS,
    value: existingValue.concat(positionAction),
  };

  addExtension({ element: drawDefinition, extension: updatedExtension });
}
