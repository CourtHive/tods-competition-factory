import { addExtension } from '@Mutate/extensions/addExtension';
import { findExtension } from '@Acquire/findExtension';

// constants
import { TIE_FORMAT_MODIFICATIONS } from '@Constants/extensionConstants';

export function tieFormatTelemetry({ drawDefinition, auditData }) {
  const { extension } = findExtension({
    name: TIE_FORMAT_MODIFICATIONS,
    element: drawDefinition,
  });

  const updatedExtension = {
    name: TIE_FORMAT_MODIFICATIONS,
    value: Array.isArray(extension?.value) ? extension?.value.concat(auditData) : [auditData],
  };
  addExtension({ element: drawDefinition, extension: updatedExtension });
}
