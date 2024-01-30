import { findExtension } from '../../../../acquire/findExtension';

import { MATCHUP_HISTORY } from '@Constants/extensionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ErrorType, NOT_FOUND } from '@Constants/errorConditionConstants';

export function getHistory({ matchUp }): {
  undoHistory?: any[];
  success?: boolean;
  error?: ErrorType;
  history?: any[];
} {
  const { extension } = findExtension({
    name: MATCHUP_HISTORY,
    element: matchUp,
  });
  if (!extension) return { error: NOT_FOUND };

  const { history = [], undoHistory = [] } = extension.value;

  return { history, undoHistory, ...SUCCESS };
}
