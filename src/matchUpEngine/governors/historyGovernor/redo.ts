import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

export function redo({ matchUp }) {
  const { history = [], undoHistory = [] } = getHistory({ matchUp });
  if (undoHistory.length) history.push(undoHistory.pop());

  return saveHistory({ matchUp, history, undoHistory });
}
