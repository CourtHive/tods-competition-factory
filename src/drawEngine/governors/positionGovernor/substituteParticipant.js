import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';

export function substituteParticipant({
  oldParticipantId,
  newParticipantId,
  drawDefinition,
  matchUpId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!oldParticipantId || !newParticipantId)
    return { error: MISSING_PARTICIPANT_ID };

  return { ...SUCCESS };
}
