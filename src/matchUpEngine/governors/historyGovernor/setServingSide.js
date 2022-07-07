import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

import { INVALID_SIDE_NUMBER } from '../../../constants/errorConditionConstants';

export function setServingSide({ matchUp, sideNumber }) {
  // TODO: check game validity
  if (![1, 2].includes(sideNumber)) return { error: INVALID_SIDE_NUMBER };

  // do not destructure undoHistory; it is destroyed when adding to history
  const { history = [] } = getHistory({ matchUp });
  history.push({ srv: sideNumber });

  return saveHistory({ matchUp, history });
}
