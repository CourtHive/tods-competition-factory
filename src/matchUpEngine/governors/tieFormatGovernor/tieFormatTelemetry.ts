import { addExtension } from '../../../global/functions/producers/addExtension';
import { findExtension } from '../../../global/functions/deducers/findExtension';

import { TIE_FORMAT_MODIFICATIONS } from '../../../constants/extensionConstants';

export function tieFormatTelemetry({ drawDefinition, auditData }) {
  const { extension } = findExtension({
    name: TIE_FORMAT_MODIFICATIONS,
    element: drawDefinition,
  });

  const updatedExtension = {
    name: TIE_FORMAT_MODIFICATIONS,
    value: Array.isArray(extension?.value)
      ? extension?.value.concat(auditData)
      : [auditData],
  };
  addExtension({ element: drawDefinition, extension: updatedExtension });
}
