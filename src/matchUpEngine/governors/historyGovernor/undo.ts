import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

export function undo({ matchUp }) {
  const { history = [], undoHistory = [] } = getHistory({ matchUp });
  undoHistory.push(history.pop());

  return saveHistory({ matchUp, history, undoHistory });
}
