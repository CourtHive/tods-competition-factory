import { MAIN } from '../../../constants/drawDefinitionConstants';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function promoteAlternate({
  tournamentRecord,
  event,

  participantId,
  stage = MAIN,
  stageSequence,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  console.log({ event, stage, stageSequence });
}
