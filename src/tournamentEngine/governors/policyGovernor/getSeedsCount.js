import {
  MISSING_DRAW_SIZE,
  MISSING_PARTICIPANT_COUNT,
  INVALID_POLICY_DEFINITION,
  MISSING_POLICY_DEFINITION,
  MISSING_SEEDCOUNT_THRESHOLDS,
  PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';
import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';

/**
 *
 * @param {boolean} requireParticipantCount - whether or not to consider participantCount
 * @param {boolean} drawSizeProgression - drawSizeProgression indicates that rules for all smaller drawSizes should be considered
 * @param {object} policyDefinition - polictyDefinition object
 * @param {number} participantCount - number of participants in draw structure
 * @param {number} drawSize - number of positions available in draw structure
 */
export function getSeedsCount({
  requireParticipantCount = true,
  drawSizeProgression = false,
  policyDefinition,
  participantCount,
  drawSize,
} = {}) {
  if (!policyDefinition) return { error: MISSING_POLICY_DEFINITION };
  if (requireParticipantCount && !participantCount)
    return { error: MISSING_PARTICIPANT_COUNT };
  if (!drawSize) return { error: MISSING_DRAW_SIZE };

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
