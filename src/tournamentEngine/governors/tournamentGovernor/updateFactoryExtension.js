import { findExtension } from '../../../global/functions/deducers/findExtension';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { extensionConstants } from '../../../constants/extensionConstants';

const { FACTORY } = extensionConstants;

export function updateFactoryExtension({ tournamentRecord, value }) {
  const { extension } = findExtension({
    element: tournamentRecord,
    name: FACTORY,
  });

  const updatedExtension = {
    name: FACTORY,
    value: {
      ...extension?.value,
      ...value,
    },
  };

  addExtension({ element: tournamentRecord, extension: updatedExtension });
}
