import { getMatchUpFormatTiming } from './getMatchUpFormatTiming';
import { findPolicy } from '../policyGovernor/findPolicy';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { POLICY_TYPE_SCORING } from '../../../constants/policyConstants';

/**
 * method requires an array of target matchUpFormats either be defined in scoring policy or passed in as parameter
 *
 * @param {string[]} matchUpFormats - optional - array of targetd matchUpFormats
 * @param {string} eventId - resolved to { event } by tournamentEngine
 * @param {string} categoryType - optional filter
 *
 * @returns { eventMatchUpFormatTiming }
 */
export function getEventMatchUpFormatTiming({
  tournamentRecord,
  matchUpFormats, // optional - can be retrieved from policy
  categoryType, // optional - categoryType is not part of event attributes
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  if (!matchUpFormats) {
    const { policy } = findPolicy({
      tournamentRecord,
      event,
      policyType: POLICY_TYPE_SCORING,
    });
    matchUpFormats = policy?.matchUpFormats || [];
  }

  const { eventType, eventId, category } = event;
  const categoryName = category?.categoryName;

  if (!eventId) return { error: MISSING_EVENT };

  const relevantMatchUpFormats = matchUpFormats.filter(
    ({ categoryNames, categoryTypes }) =>
      (!categoryNames?.length && !categoryTypes?.length) ||
      categoryNames?.includes(categoryName) ||
      categoryTypes?.includes(categoryType)
  );

  const eventMatchUpFormatTiming = relevantMatchUpFormats.map(
    ({ matchUpFormat, description }) =>
      Object.assign(
        {},
        {
          ...getMatchUpFormatTiming({
            tournamentRecord,
            matchUpFormat,
            categoryName,
            categoryType,
            eventType,
          }),
          description,
          matchUpFormat,
        }
      )
  );

  return { eventMatchUpFormatTiming };
}
