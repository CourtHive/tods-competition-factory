import { findPolicy } from '../policyGovernor/findPolicy';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { POLICY_TYPE_SCHEDULING } from '../../../constants/policyConstants';

/**
 * find the policy-defined average matchUp time for a given category
 *
 * @param {object} tournamentRecord - supplied by tournamentEngine when state is set
 * @param {string} drawId - resolved to drawDefinition by tournamentEngine
 * @param {string} eventId - resolved to event by tournamentEngine
 * @param {string} matchUpFormat
 *
 * @returns
 */
export function getAverageMatchUpTime({
  tournamentRecord,
  event,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const policy = findPolicy({
    tournamentRecord,
    event,
    policyType: POLICY_TYPE_SCHEDULING,
  });

  if (!policy) return { error: POLICY_NOT_FOUND };

  const { defaultTimes, averageMatchUpTimes } = policy;

  if (!matchUpFormat || !averageMatchUpTimes) {
    const averageMatchUpTime = defaultTimes?.averageMatchUpTime;
    return averageMatchUpTime || { minutes: { ['ALL']: 90 } };
  }

  const codeMatch = averageMatchUpTimes.find(({ matchUpFormatCodes }) =>
    matchUpFormatCodes?.includes(matchUpFormat)
  );

  return { codeMatch };
}
