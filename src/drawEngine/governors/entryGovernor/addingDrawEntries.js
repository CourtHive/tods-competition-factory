import { participantInEntries } from '../../getters/entryGetter';
import { validStage, stageSpace } from '../../getters/stageGetter';

import {
  DIRECT_ACCEPTANCE,
  EXISTING_PARTICIPANT,
} from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addEntry({
  participantId,
  participant,
  stage,
  drawDefinition,
  entryStatus = DIRECT_ACCEPTANCE,
}) {
  if (!drawDefinition) return { error: 'Draw undefined' };
  if (!stage) return { error: 'Missing Stage' };
  if (!validStage({ stage, drawDefinition })) return { error: 'Invalid Stage' };
  const spaceAvailable = stageSpace({ stage, drawDefinition, entryStatus });
  if (!spaceAvailable.success) return { error: spaceAvailable.error };

  participantId = participantId || (participant && participant.participantId);
  if (!participantId) return { error: 'Invalid Participant' };
  if (participantInEntries({ participantId, drawDefinition })) {
    return { error: EXISTING_PARTICIPANT };
  }
  const entry = Object.assign({}, participant, {
    participantId,
    entryStage: stage,
    entryStatus,
  });
  drawDefinition.entries.push(entry);
  return SUCCESS;
}

export function addDrawEntries({
  participantIds,
  stage,
  drawDefinition,
  entryStatus = DIRECT_ACCEPTANCE,
}) {
  if (!stage) return { error: 'Missing Stage' };
  if (!drawDefinition) return { error: 'Draw undefined' };
  if (!Array.isArray(participantIds))
    return { error: 'Invalid participants array' };
  if (!validStage({ stage, drawDefinition })) return { error: 'Invalid Stage' };

  const spaceAvailable = stageSpace({ stage, drawDefinition, entryStatus });
  if (!spaceAvailable.success) return { error: spaceAvailable.error };
  const positionsAvailable = spaceAvailable.positionsAvailable || 0;
  if (positionsAvailable < participantIds.length)
    return { error: 'More Participants than Draw Positions' };

  const invalidEntries = participantIds.reduce((invalid, participantId) => {
    if (participantInEntries({ participantId, drawDefinition })) {
      return invalid.concat({ participantId, error: EXISTING_PARTICIPANT });
    }
    return invalid;
  }, []);

  if (invalidEntries.length) {
    return { error: 'Entry Errors', invalidEntries };
  }

  participantIds.forEach(participantId => {
    const entry = Object.assign(
      {},
      { participantId },
      { entryStage: stage, entryStatus }
    );
    drawDefinition.entries.push(entry);
  });

  return SUCCESS;
}
