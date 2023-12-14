import { findDrawDefinitionExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';

import { ENTRY_PROFILE } from '../../constants/extensionConstants';
import { DrawDefinition } from '../../types/tournamentFromSchema';

type GetEntryProfileArgs = {
  drawDefinition: DrawDefinition;
};
export function getEntryProfile({ drawDefinition }: GetEntryProfileArgs) {
  const { extension } = findDrawDefinitionExtension({
    name: ENTRY_PROFILE,
    drawDefinition,
  });
  const entryProfile = extension?.value || {};
  return { entryProfile };
}
