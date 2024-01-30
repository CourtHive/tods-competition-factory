import { addExtension } from '../extensions/addExtension';
import { extensionConstants } from '@Constants/extensionConstants';
import { findExtension } from '../../acquire/findExtension';

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
