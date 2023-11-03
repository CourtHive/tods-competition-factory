import { isValid } from '../../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { findEventExtension } from '../../queryGovernor/extensionQueries';
import { getMatchUpFormatTiming } from './getMatchUpFormatTiming';
import { findPolicy } from '../../policyGovernor/findPolicy';
import { definedAttributes, unique } from '../../../../utilities';

import POLICY_SCHEDULING_DEFAULT from '../../../../fixtures/policies/POLICY_SCHEDULING_DEFAULT';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';
import { Event, Tournament } from '../../../../types/tournamentFromSchema';
import {
  ErrorType,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import {
  POLICY_TYPE_SCHEDULING,
  POLICY_TYPE_SCORING,
} from '../../../../constants/policyConstants';

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
  info?: string;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  let matchUpFormatDefinitions: any[] = [];
  let info;

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
      let matchUpAverageTimes, matchUpRecoveryTimes;
      if (extension?.value) {
        ({ matchUpAverageTimes, matchUpRecoveryTimes } = extension.value);
      } else {
        ({ matchUpAverageTimes, matchUpRecoveryTimes } =
          POLICY_SCHEDULING_DEFAULT[POLICY_TYPE_SCHEDULING]);
      }
      matchUpFormatDefinitions = unique(
        [
          ...(matchUpAverageTimes || []).map((at) => at.matchUpFormatCodes),
          ...(matchUpRecoveryTimes || []).map((at) => at.matchUpFormatCodes),
        ].flat()
      ).map((matchUpFormat) => ({ matchUpFormat }));
      info = 'default scheduling policy in use';
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
    category?.categoryName ?? category?.ageCategoryCode ?? eventId;

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
      return {
        matchUpFormat,
        description,
        ...timing,
      };
    }
  );

  return definedAttributes({ eventMatchUpFormatTiming, info });
}
