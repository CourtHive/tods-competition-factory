import { getEliminationDrawSize } from '../../../drawEngine/getters/getEliminationDrawSize';

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
 * @param {object} policyDefinition - polictyDefinition object
 */
export function getSeedsCount({
  requireParticipantCount = true,
  drawSizeProgression = false,
  policyDefinition,
  participantCount,
  drawSize,
} = {}) {
  if (!policyDefinition) return { error: MISSING_POLICY_DEFINITION };
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

  const policy = policyDefinition[POLICY_TYPE_SEEDING];
  if (!policy) return { error: INVALID_POLICY_DEFINITION };

  const seedsCountThresholds = policy.seedsCountThresholds;
  if (!seedsCountThresholds) return { error: MISSING_SEEDCOUNT_THRESHOLDS };

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
