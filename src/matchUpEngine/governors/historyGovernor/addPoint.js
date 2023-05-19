import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addPoint({ matchUp, point }) {
  // TODO: check point validity
  if (!point) return { error: MISSING_VALUE };
  if (typeof point !== 'object')
    return { error: INVALID_VALUES, context: { point } };

  // do not destructure undoHistory; it is destroyed when adding to history
  const { history = [] } = getHistory({ matchUp });
  history.push(point);

  return saveHistory({ matchUp, history });
}
