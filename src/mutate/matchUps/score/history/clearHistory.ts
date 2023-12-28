import { saveHistory } from './saveHistory';

export function clearHistory({ matchUp }) {
  return saveHistory({ matchUp });
}
