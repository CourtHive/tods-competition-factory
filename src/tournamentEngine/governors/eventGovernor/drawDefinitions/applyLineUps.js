import { findMatchUp } from '../../../../drawEngine/getters/getMatchUps/findMatchUp';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  INVALID_MATCHUP,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function applyLineUps({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  lineUps,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  if (typeof matchUpId !== 'string') return { error: INVALID_MATCHUP };

  const result = findMatchUp({ drawDefinition, matchUpId });
  if (result.error) return result;

  console.log({ lineUps });
  // verify integrity of lineUps...
  // 1. all participantIds must be valid individualParticipantIds
  // 2. all participantIds must be members of the teams on the respective sides
  // 3. there should only be a single participantId for a given collectionPosition in singles
  // 4. there should be at most two participantIds for a given collectionPosition in doubles

  return { ...SUCCESS };
}
