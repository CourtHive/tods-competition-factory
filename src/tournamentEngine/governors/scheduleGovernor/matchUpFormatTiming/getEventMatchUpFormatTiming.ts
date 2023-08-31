import { isValid } from '../../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { findEventExtension } from '../../queryGovernor/extensionQueries';
import { getMatchUpFormatTiming } from './getMatchUpFormatTiming';
import { findPolicy } from '../../policyGovernor/findPolicy';
import { unique } from '../../../../utilities';

import { POLICY_TYPE_SCORING } from '../../../../constants/policyConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';
import { Event, Tournament } from '../../../../types/tournamentFromSchema';
import {
  ErrorType,
  MISSING_EVENT,
  MISSING_SCORING_POLICY,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

type GetEventMatchUpFormatTimingArgs = {
  tournamentRecord: Tournament;
  matchUpFormats?: string[];
  categoryType?: string;
  event: Event;
};

export function getEventMatchUpFormatTiming({
  tournamentRecord,
  matchUpFormats, // optional - can be retrieved from policy
  categoryType, // optional - categoryType is not part of event attributes
  event,
}: GetEventMatchUpFormatTimingArgs): {
  eventMatchUpFormatTiming?: any;
  error?: ErrorType;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  let matchUpFormatDefinitions: any[] = [];
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
        name: SCHEDULE_TIMING,
        event,
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
    const uniqueMatchUpFormats: any[] = [];
    matchUpFormatDefinitions = matchUpFormats
      .map((definition) => {
        const definitionObject =
          typeof definition === 'string'
            ? { matchUpFormat: definition }
            : definition;

        if (uniqueMatchUpFormats.includes(definitionObject?.matchUpFormat))
          return;
        if (!isValid(definitionObject?.matchUpFormat)) return;
        uniqueMatchUpFormats.push(definitionObject.matchUpFormat);
        return definitionObject;
      })
      .filter(Boolean);
  }
  const { eventType, eventId, category } = event;
  const categoryName =
    category?.categoryName || category?.ageCategoryCode || eventId;

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
