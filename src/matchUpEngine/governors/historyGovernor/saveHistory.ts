import { addExtension } from '../../../global/functions/producers/addExtension';

import { MATCHUP_HISTORY } from '../../../constants/extensionConstants';

export function saveHistory({ matchUp, history, undoHistory }) {
  const extension = {
    value: { history, undoHistory },
    name: MATCHUP_HISTORY,
  };
  return addExtension({ element: matchUp, extension });
}
