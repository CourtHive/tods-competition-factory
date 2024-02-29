import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { addExtension } from '@Mutate/extensions/addExtension';
import { findExtension } from '@Acquire/findExtension';

// constants
import { AUDIT_POSITION_ACTIONS } from '@Constants/extensionConstants';
import { MAIN } from '@Constants/drawDefinitionConstants';

// updates 'positionActions' extension to keep track of positionActions by end-user
// TODO: consider adding timestamp attribute to positionAction object
export function addPositionActionTelemetry({ drawDefinition, positionAction }) {
  const { extension } = findExtension({
    name: AUDIT_POSITION_ACTIONS,
    element: drawDefinition,
  });

  const existingValue = Array.isArray(extension?.value) ? extension?.value ?? [] : [];

  if (!existingValue?.length) {
    const mainStructure = drawDefinition.structures.find((structure) => structure.stage === MAIN);
    if (mainStructure) {
      const initialAssignments = getPositionAssignments({
        structure: mainStructure,
      }).positionAssignments?.map(({ drawPosition, participantId, bye, qualifier }) => ({
        drawPosition,
        participantId,
        qualifier,
        bye,
      }));

      existingValue.push({
        name: 'initialMainAssignments',
        initialAssignments,
      });
    }
  }

  const updatedExtension = {
    value: existingValue.concat(positionAction),
    name: AUDIT_POSITION_ACTIONS,
  };

  addExtension({ element: drawDefinition, extension: updatedExtension });
}
