import { findExtension } from '../../../global/functions/deducers/findExtension';

import { MATCHUP_HISTORY } from '../../../constants/extensionConstants';
import { NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getHistory({ matchUp }) {
  const { extension } = findExtension({
    name: MATCHUP_HISTORY,
    element: matchUp,
  });
  if (!extension) return { error: NOT_FOUND };

  const { history = [], undoHistory = [] } = extension.value;

  return { history, undoHistory, ...SUCCESS };
}
