import { isValidMatchUpFormat } from '../../../../drawEngine/governors/matchUpGovernor/isValidMatchUpFormat';
import { findEventExtension } from '../../queryGovernor/extensionQueries';
import { getMatchUpFormatTiming } from './getMatchUpFormatTiming';
import { findPolicy } from '../../policyGovernor/findPolicy';
import { unique } from '../../../../utilities';

import { POLICY_TYPE_SCORING } from '../../../../constants/policyConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';
import {
  MISSING_EVENT,
  MISSING_SCORING_POLICY,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

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

  let matchUpFormatDefinitions = [];
  if (!matchUpFormats?.length) {
    const { policy } = findPolicy({
      policyType: POLICY_TYPE_SCORING,
      tournamentRecord,
      event,
    });
    if (policy?.matchUpFormats) {
      matchUpFormatDefinitions = policy?.matchUpFormats;
    } else {
      const { extension } = findEventExtension({
        event,
        name: SCHEDULE_TIMING,
      });
      if (extension?.value) {
        matchUpFormatDefinitions = unique(
          [
            ...(extension.value.matchUpAverageTimes || []).map(
              (at) => at.matchUpFormatCodes
            ),
            ...(extension.value.matchUpRecoveryTimes || []).map(
              (at) => at.matchUpFormatCodes
            ),
          ].flat()
        ).map((matchUpFormat) => ({ matchUpFormat }));
      } else {
        return { error: MISSING_SCORING_POLICY };
      }
    }
  } else {
    matchUpFormatDefinitions = unique(
      matchUpFormats.filter(isValidMatchUpFormat)
    ).map((matchUpFormat) => ({ matchUpFormat }));
  }

  const { eventType, eventId, category } = event;
  const categoryName = category?.categoryName;

  if (!eventId) return { error: MISSING_EVENT };

  const eventMatchUpFormatTiming = matchUpFormatDefinitions.map(
    ({ matchUpFormat, description }) => {
      const timing = getMatchUpFormatTiming({
        tournamentRecord,
        matchUpFormat,
        categoryName,
        categoryType,
        eventType,
        event,
      });
      return Object.assign(
        {},
        {
          ...timing,
          description,
          matchUpFormat,
        }
      );
    }
  );

  return { eventMatchUpFormatTiming };
}
