import { findExtension } from '../../../global/functions/deducers/findExtension';
import { addExtension } from '../../../global/functions/producers/addExtension';

// updates 'positionActions' extension to keep track of positionActions by end-user
export function addPositionActionTelemetry({ drawDefinition, positionAction }) {
  const { extension } = findExtension({
    element: drawDefinition,
    name: 'positionActions',
  });
  const updatedExtension = {
    name: 'positionActions',
    value: Array.isArray(extension?.value)
      ? extension.value.concat(positionAction)
      : [positionAction],
  };
  addExtension({ element: drawDefinition, extension: updatedExtension });
}
