import { getPolicyDefinitions } from '../../../global/functions/deducers/getAppliedPolicies';
import { getEliminationDrawSize } from '../../../drawEngine/getters/getEliminationDrawSize';
import { isConvertableInteger } from '../../../utilities/math';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';

import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import {
  MISSING_DRAW_SIZE,
  MISSING_PARTICIPANT_COUNT,
  INVALID_POLICY_DEFINITION,
  MISSING_SEEDCOUNT_THRESHOLDS,
  PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {boolean} requireParticipantCount - whether or not to consider participantsCount
 * @param {boolean} drawSizeProgression - drawSizeProgression indicates that rules for all smaller drawSizes should be considered
 * @param {number} participantsCount - number of participants in draw structure // TODO: migrate to participantsCount
 * @param {number} drawSize - number of positions available in draw structure
 * @param {object} policyDefinitions - polictyDefinition object
 * @param {object} drawDefinition - optional - retrieved automatically if drawId is provided
 * @param {string} drawId - allows drawDefinition and event to be retrieved by tournamentEngine from tournament record
 */

export function getSeedsCount(params?): ResultType & { seedsCount?: number } {
  let {
    drawSizeProgression = false,
    policyDefinitions,
    drawSize,
  } = params || {};
  const {
    requireParticipantCount = true,
    tournamentRecord,
    drawDefinition,
    event,
  } = params || {};
  const stack = 'getSeedsCount';

  const participantsCount =
    params?.participantsCount || params?.participantCount;

  if (!policyDefinitions) {
    const result = getPolicyDefinitions({
      tournamentRecord,
      drawDefinition,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
    policyDefinitions = result.policyDefinitions;
  }
  const validParticpantCount = isConvertableInteger(participantsCount);

  if (participantsCount && !validParticpantCount)
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { participantsCount },
      stack,
    });
  if (requireParticipantCount && !validParticpantCount)
    return decorateResult({
      result: { error: MISSING_PARTICIPANT_COUNT },
      stack,
    });

  if (isNaN(drawSize)) {
    if (participantsCount) {
      ({ drawSize } = getEliminationDrawSize({
        participantsCount,
      }));
    } else {
      return decorateResult({ result: { error: MISSING_DRAW_SIZE }, stack });
    }
  }

  const consideredParticipantCount =
    (requireParticipantCount && participantsCount) || drawSize;
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
    return participantsCount >= threshold.minimumParticipantCount
      ? threshold.seedsCount
      : seedsCount;
  }, 0);

  return { seedsCount };
}
