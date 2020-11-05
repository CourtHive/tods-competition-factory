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
  if (!policyDefinition) return { error: 'Missing policyDefinition' };
  if (requireParticipantCount && !participantCount)
    return { error: 'Missing participantCount' };
  if (!drawSize) return { error: 'Missing drawSize' };

  const consideredParticipantCount =
    (requireParticipantCount && participantCount) || drawSize;
  if (consideredParticipantCount > drawSize)
    return { error: 'participantCount exceeds drawSize' };

  const policy = policyDefinition[POLICY_TYPE_SEEDING];
  if (!policy) return { error: 'Invalid policyDefinition' };

  const seedsCountThresholds = policy.seedsCountThresholds;
  if (!seedsCountThresholds)
    return { error: 'Missing seedCountThresholds definitions' };

  const relevantThresholds = seedsCountThresholds.filter(threshold => {
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
