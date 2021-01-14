import {
  ALTERNATE,
  DIRECT_ACCEPTANCE,
} from '../../../../constants/entryStatusConstants';
import {
  MISSING_EVENT,
  INVALID_ENTRY_STATUS,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ENTRY_NOT_FOUND,
  PARTICIPANT_NOT_FOUND_IN_STAGE,
  PARTICIPANT_NOT_ENTERED_IN_STAGE,
} from '../../../../constants/errorConditionConstants';

import { MAIN } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function promoteAlternate({
  tournamentRecord,
  drawDefinition,
  event,

  participantId,
  stage = MAIN,
  stageSequence,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (!event.entries) event.entries = [];

  if (event) {
    const result = promoteWithinElement({
      element: event,
      participantId,
      stage,
      stageSequence,
    });
    if (result.error) return result;
  }
  if (drawDefinition) {
    const result = promoteWithinElement({
      element: drawDefinition,
      participantId,
      stage,
      stageSequence,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}

function promoteWithinElement({
  element,
  participantId,
  stage,
  stageSequence,
}) {
  const alternates = element.entries.filter(
    (entry) => entry.entryStatus === ALTERNATE
  );

  // if no participantId is provided, take the alternate with the lowest entryPosition
  const participantEntry =
    (element.entries || []).find(
      (entry) => entry.participantId === participantId
    ) ||
    alternates.reduce((participantEntry, entry) => {
      const { entryPosition } = entry;
      return !entryPosition
        ? participantEntry
        : !participantEntry || entryPosition < participantEntry.entryPosition
        ? entry
        : participantEntry;
    }, undefined);

  if (!participantEntry) return { error: PARTICIPANT_ENTRY_NOT_FOUND };

  if (participantEntry.entryStatus !== ALTERNATE)
    return { error: INVALID_ENTRY_STATUS };
  if (participantEntry.stage && participantEntry.entryStage !== stage)
    return { error: PARTICIPANT_NOT_ENTERED_IN_STAGE };
  if (stageSequence && participantEntry.stageSequence !== stageSequence)
    return { error: PARTICIPANT_NOT_FOUND_IN_STAGE };

  participantEntry.entryStatus = DIRECT_ACCEPTANCE;

  // QUESTION: should entryPosition be calculated based on entryPositions of existing DIRECT_ACCEPTANCE participants?

  // cleanUp
  const entryPosition = participantEntry?.entryPosition;
  delete participantEntry.entryPosition;

  if (entryPosition) {
    // if promoted participant has an entryPosition, adjust all other alternates with an entryPosition higher than promoted participant
    element.entries.forEach((entry) => {
      if (
        entry.entryStatus === ALTERNATE &&
        entry.entryPosition > entryPosition
      ) {
        entry.entryPosition = entry.entryPosition - 1;
      }
    });
  }

  return SUCCESS;
}
