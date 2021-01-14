import { modifySeedAssignment as drawEngineModifySeedAssignment } from '../../../drawEngine/governors/entryGovernor/modifySeedAssignment';

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
  drawDefinition,
  participantId,
  structureId,
  seedValue,
}) {
  return drawEngineModifySeedAssignment({
    drawDefinition,
    participantId,
    structureId,
    seedValue,
  });
}
