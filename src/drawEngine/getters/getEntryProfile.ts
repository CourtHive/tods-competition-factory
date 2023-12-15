import { findExtension } from '../../acquire/findExtensionQueries';

import { ENTRY_PROFILE } from '../../constants/extensionConstants';
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
