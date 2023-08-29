import { addExtension } from '../../../global/functions/producers/addExtension';

import { MATCHUP_HISTORY } from '../../../constants/extensionConstants';
import { MatchUp } from '../../../types/tournamentFromSchema';

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
