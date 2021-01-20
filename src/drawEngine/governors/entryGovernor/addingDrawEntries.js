import { participantInEntries } from '../../getters/entryGetter';
import { validStage, stageSpace } from '../../getters/stageGetter';

import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';
import {
  INVALID_STAGE,
  MISSING_STAGE,
  INVALID_ENTRIES,
  EXISTING_PARTICIPANT,
  MISSING_DRAW_DEFINITION,
  INVALID_PARTICIPANT_IDS,
  MISSING_PARTICIPANT_ID,
  MORE_PARTICIPANTS_THAN_DRAW_POSITIONS,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 *
 * @param {object} drawDefinition - drawDefinition object; passed in automatically by drawEngine when drawEngine.setSTate(drawdefinition) has been previously called
 * @param {string} participantId - id of participant being entered into draw
 * @param {object} participant - optional; for passing participantId
 * @param {string} entryStage - either QUALIFYING or MAIN
 * @param {string} entryStatus - entryStatusEnum (e.g. DIRECT_ACCEPTANCE, WILDCARD)
 *
 */
export function addDrawEntry({
  drawDefinition,
  participantId,
  participant,
  entryStage,
  entryStatus = DIRECT_ACCEPTANCE,
  entryPosition,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!entryStage) return { error: MISSING_STAGE };
  if (!validStage({ stage: entryStage, drawDefinition }))
    return { error: INVALID_STAGE };
  const spaceAvailable = stageSpace({
    stage: entryStage,
    drawDefinition,
    entryStatus,
  });
  if (!spaceAvailable.success) return { error: spaceAvailable.error };

  participantId = participantId || (participant && participant.participantId);
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (participantInEntries({ participantId, drawDefinition })) {
    return { error: EXISTING_PARTICIPANT };
  }
  const entry = Object.assign({}, participant, {
    participantId,
    entryStage,
    entryStatus,
    entryPosition,
  });
  drawDefinition.entries.push(entry);
  return SUCCESS;
}

/**
 *
 * @param {object} drawDefinition - drawDefinition object
 * @param {string[]} participantIds - ids of participants to add to drawDefinition.entries
 * @param {string} entryStatus - entry status to be applied to all draw Entries, e.g. DIRECT ACCEPTANCE
 * @param {string} stage - entry stage for particpants (QUALIFYING, MAIN)
 *
 */
export function addDrawEntries({
  drawDefinition,
  participantIds,
  entryStatus = DIRECT_ACCEPTANCE,
  stage,
}) {
  if (!stage) return { error: MISSING_STAGE };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(participantIds)) return { error: INVALID_PARTICIPANT_IDS };
  if (!validStage({ stage, drawDefinition })) return { error: INVALID_STAGE };

  const spaceAvailable = stageSpace({ stage, drawDefinition, entryStatus });
  if (!spaceAvailable.success) return { error: spaceAvailable.error };
  const positionsAvailable = spaceAvailable.positionsAvailable || 0;
  if (positionsAvailable < participantIds.length)
    return { error: MORE_PARTICIPANTS_THAN_DRAW_POSITIONS };

  const invalidParticipantIds = participantIds.reduce(
    (invalid, participantId) => {
      if (participantInEntries({ participantId, drawDefinition })) {
        return invalid.concat({ participantId, error: EXISTING_PARTICIPANT });
      }
      return invalid;
    },
    []
  );

  if (invalidParticipantIds.length) {
    return { error: INVALID_ENTRIES, invalidParticipantIds };
  }

  participantIds.forEach((participantId) => {
    const entry = Object.assign(
      {},
      { participantId },
      { entryStage: stage, entryStatus }
    );
    drawDefinition.entries.push(entry);
  });

  return SUCCESS;
}
