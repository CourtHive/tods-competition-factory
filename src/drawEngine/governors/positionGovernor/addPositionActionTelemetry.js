import { findExtension } from '../../../global/functions/deducers/findExtension';
import { addExtension } from '../../../global/functions/producers/addExtension';

import { AUDIT_POSITION_ACTIONS } from '../../../constants/extensionConstants';

// updates 'positionActions' extension to keep track of positionActions by end-user
export function addPositionActionTelemetry({ drawDefinition, positionAction }) {
  const { extension } = findExtension({
    element: drawDefinition,
    name: AUDIT_POSITION_ACTIONS,
  });
  const updatedExtension = {
    name: AUDIT_POSITION_ACTIONS,
    value: Array.isArray(extension?.value)
      ? extension.value.concat(positionAction)
      : [positionAction],
  };
  addExtension({ element: drawDefinition, extension: updatedExtension });
}
