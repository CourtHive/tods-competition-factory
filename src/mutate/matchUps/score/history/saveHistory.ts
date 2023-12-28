import { addExtension } from '../../../extensions/addExtension';

import { MATCHUP_HISTORY } from '../../../../constants/extensionConstants';
import { MatchUp } from '../../../../types/tournamentTypes';

type SaveHistoryArgs = {
  undoHistory?: any[];
  matchUp: MatchUp;
  history?: any[];
};
export function saveHistory({
  undoHistory,
  history,
  matchUp,
}: SaveHistoryArgs) {
  const extension = {
    value: { history, undoHistory },
    name: MATCHUP_HISTORY,
  };
  return addExtension({ element: matchUp, extension });
}
