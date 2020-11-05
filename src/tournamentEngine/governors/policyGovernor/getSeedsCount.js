import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';

/**
 *
 * @param {boolean} drawSizeProgression - drawSizeProgression indicates that rules for all smaller drawSizes should be considered
 * @param {object} policyDefinition - polictyDefinition object
 * @param {number} participantCount - number of participants in draw structure
 * @param {number} drawSize - number of positions available in draw structure
 */
export function getSeedsCount({
  drawSizeProgression = false,
  policyDefinition,
  participantCount,
  drawSize,
} = {}) {
  if (!policyDefinition) return { error: 'Missing policyDefinition' };
  if (!participantCount) return { error: 'Missing participantCount' };
  if (!drawSize) return { error: 'Missing drawSize' };
  if (participantCount > drawSize)
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
