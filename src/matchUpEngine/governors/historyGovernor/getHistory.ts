import { findExtension } from '../../../global/functions/deducers/findExtension';

import { MATCHUP_HISTORY } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

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
