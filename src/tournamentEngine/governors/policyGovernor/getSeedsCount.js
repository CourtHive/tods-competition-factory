import { getEliminationDrawSize } from '../../../drawEngine/getters/getEliminationDrawSize';
import { getPolicyDefinitions } from '../queryGovernor/getPolicyDefinitions';

import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import {
  MISSING_DRAW_SIZE,
  MISSING_PARTICIPANT_COUNT,
  INVALID_POLICY_DEFINITION,
  MISSING_POLICY_DEFINITION,
  MISSING_SEEDCOUNT_THRESHOLDS,
  PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {boolean} requireParticipantCount - whether or not to consider participantCount
 * @param {boolean} drawSizeProgression - drawSizeProgression indicates that rules for all smaller drawSizes should be considered
 * @param {number} participantCount - number of participants in draw structure
 * @param {number} drawSize - number of positions available in draw structure
 * @param {object} policyDefinitions - polictyDefinition object
 * @param {object} drawDefinition - optional - retrieved automatically if drawId is provided
 * @param {string} drawId - allows drawDefinition and event to be retrieved by tournamentEngine from tournament record
 */
export function getSeedsCount({
  tournamentRecord,
  drawDefinition,
  event,

  requireParticipantCount = true,
  drawSizeProgression = false,
  policyDefinitions,
  participantCount,
  drawSize,
} = {}) {
  if (!policyDefinitions) {
    const result = getPolicyDefinitions({
      tournamentRecord,
      drawDefinition,
      event,
    });
    if (result.error) return result;
    if (!result.policyDefinitions) return { error: MISSING_POLICY_DEFINITION };
    policyDefinitions = result.policyDefinitions;
  }
  if (participantCount && isNaN(participantCount))
    return { error: INVALID_VALUES };
  if (requireParticipantCount && !participantCount)
    return { error: MISSING_PARTICIPANT_COUNT };
  if (!drawSize) {
    if (participantCount) {
      ({ drawSize } = getEliminationDrawSize({
        participantCount,
      }));
    } else {
      return { error: MISSING_DRAW_SIZE };
    }
  }

  const consideredParticipantCount =
    (requireParticipantCount && participantCount) || drawSize;
  if (consideredParticipantCount > drawSize)
    return { error: PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE };

  const policy = policyDefinitions[POLICY_TYPE_SEEDING];
  if (!policy) return { error: INVALID_POLICY_DEFINITION };

  const seedsCountThresholds = policy.seedsCountThresholds;
  if (!seedsCountThresholds) return { error: MISSING_SEEDCOUNT_THRESHOLDS };
  if (policy.drawSizeProgression !== undefined)
    drawSizeProgression = policy.drawSizeProgression;

  const relevantThresholds = seedsCountThresholds.filter((threshold) => {
    return drawSizeProgression
      ? threshold.drawSize <= drawSize
      : drawSize === threshold.drawSize;
  });

  const seedsCount = relevantThresholds.reduce((seedsCount, threshold) => {
    return participantCount >= threshold.minimumParticipantCount
      ? threshold.seedsCount
      : seedsCount;
  }, 0);

  return { seedsCount };
}
