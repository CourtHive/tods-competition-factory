import { findExtension } from '../../acquire/findExtension';

import { ENTRY_PROFILE } from '@Constants/extensionConstants';
import { DrawDefinition } from '../../types/tournamentTypes';

type GetEntryProfileArgs = {
  drawDefinition: DrawDefinition;
};
export function getEntryProfile({ drawDefinition }: GetEntryProfileArgs) {
  const { extension } = findExtension({
    element: drawDefinition,
    name: ENTRY_PROFILE,
  });
  const entryProfile = extension?.value || {};
  return { entryProfile };
}
