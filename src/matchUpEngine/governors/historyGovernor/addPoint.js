import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';

export function addPoint({ matchUp, point }) {
  // TODO: check point validity
  if (typeof point !== 'object') return { error: MISSING_VALUE };

  // do not destructure undoHistory; it is destroyed when adding to history
  const { history = [] } = getHistory({ matchUp });
  history.push(point);

  return saveHistory({ matchUp, history });
}
