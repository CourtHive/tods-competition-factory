import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 * remove the tieFormat from a TEAM matchUp if there is a tieFormat further up the hierarchy
 * modify the matchUp's tieMatchUps to correspond to the tieFormat found further up the hierarchy
 *
 * @param {*} param0
 * @returns
 */

export function resetTieFormat({ tournamentRecord, matchUpId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof matchUpId !== 'string') return { error: MISSING_MATCHUP_ID };

  return { ...SUCCESS };
}
