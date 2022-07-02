import { findExtension } from '../../../global/functions/deducers/findExtension';

import { MATCHUP_HISTORY } from '../../../constants/extensionConstants';

export function getHistory({ matchUp }) {
  const { extension } = findExtension({
    name: MATCHUP_HISTORY,
    element: matchUp,
  });

  return extension?.value;
}
