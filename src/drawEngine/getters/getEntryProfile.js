import { findDrawDefinitionExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';

import { ENTRY_PROFILE } from '../../constants/extensionConstants';

export function getEntryProfile({ drawDefinition }) {
  let { extension } = findDrawDefinitionExtension({
    name: ENTRY_PROFILE,
    drawDefinition,
  });
  const entryProfile = extension?.value || drawDefinition.entryProfile || {};
  return { entryProfile };
}
