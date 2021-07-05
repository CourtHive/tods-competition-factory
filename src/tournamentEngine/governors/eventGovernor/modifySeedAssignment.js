import { modifySeedAssignment as drawEngineModifySeedAssignment } from '../../../drawEngine/governors/entryGovernor/modifySeedAssignment';

import {
  INVALID_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure occurs
 * @param {object} drawDefinition - added automatically by tournamentEngine
 * @param {string} participantId - id of participant which will receive the seedValue
 * @param {string} structureId - id of structure within drawDefinition
 * @param {string} seedValue - supports value of e.g. '5-8'
 *
 */
export function modifySeedAssignment({
  tournamentRecord,
  drawDefinition,
  participantId,
  structureId,
  seedValue,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const participant = (tournamentRecord.participants || []).find(
    (participant) => participant.participantId === participantId
  );
  if (!participant) return { error: INVALID_PARTICIPANT_ID };

  return drawEngineModifySeedAssignment({
    drawDefinition,
    participantId,
    structureId,
    seedValue,
  });
}
