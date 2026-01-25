import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { addExtension } from '@Mutate/extensions/addExtension';
import { findExtension } from '@Acquire/findExtension';

// constants and types
import { POSITION_ACTIONS } from '@Constants/extensionConstants';
import { MAIN } from '@Constants/drawDefinitionConstants';
import { PolicyDefinitions } from '@Types/factoryTypes';

// updates 'positionActions' extension to keep track of positionActions by end-user

type AddPositionActionTelemetry = {
  appliedPolicies?: PolicyDefinitions;
  positionAction: any;
  drawDefinition: any;
};

export function addPositionActionTelemetry(params: AddPositionActionTelemetry) {
  const { appliedPolicies, positionAction, drawDefinition } = params;

  // true by default
  if (appliedPolicies?.audit?.[POSITION_ACTIONS] === false) return;

  const { extension } = findExtension({
    name: POSITION_ACTIONS,
    element: drawDefinition,
  });

  const existingValue = Array.isArray(extension?.value) ? (extension?.value ?? []) : [];

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
    name: POSITION_ACTIONS,
  };

  addExtension({ element: drawDefinition, extension: updatedExtension });
}
