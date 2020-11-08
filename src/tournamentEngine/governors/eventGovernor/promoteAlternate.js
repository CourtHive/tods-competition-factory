import {
  ALTERNATE,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';
import {
  MISSING_EVENT,
  INVALID_ENTRY_STATUS,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ENTRY_NOT_FOUND,
  PARTICIPANT_NOT_FOUND_IN_STAGE,
  PARTICIPANT_NOT_ENTERED_IN_STAGE,
} from '../../../constants/errorConditionConstants';

import { MAIN } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function promoteAlternate({
  tournamentRecord,
  event,

  participantId,
  stage = MAIN,
  stageSequence,
  entryStatus = DIRECT_ACCEPTANCE,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!event) return { error: MISSING_EVENT };

  const participantEntry = event.entries.find(
    entry => entry.participantId === participantId
  );
  if (!participantEntry) return { error: PARTICIPANT_ENTRY_NOT_FOUND };

  if (participantEntry.entryStatus !== ALTERNATE)
    return { error: INVALID_ENTRY_STATUS };
  if (participantEntry.entryStage !== stage)
    return { error: PARTICIPANT_NOT_ENTERED_IN_STAGE };
  if (stageSequence && participantEntry.stageSequence !== stageSequence)
    return { error: PARTICIPANT_NOT_FOUND_IN_STAGE };

  participantEntry.entryStatus = entryStatus;

  return SUCCESS;
}
