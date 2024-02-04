import { getEventPublishStatus } from '../event/getEventPublishStatus';
import { definedAttributes } from '@Tools/definedAttributes';
import { hydrateParticipants } from '../participants/hydrateParticipants';
import { MISSING_EVENT } from '@Constants/errorConditionConstants';
import { getContextContent } from '../hierarchical/getContextContent';
import { getDrawMatchUps } from './drawMatchUps';

import { SUCCESS } from '@Constants/resultConstants';
import { GetMatchUpsArgs, GroupsMatchUpsResult } from '@Types/factoryTypes';

export function eventMatchUps(params: GetMatchUpsArgs): GroupsMatchUpsResult {
  let { participants: tournamentParticipants, contextContent, participantMap } = params;

  const {
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    usePublishState,
    contextFilters,
    matchUpFilters,
    contextProfile,
    nextMatchUps,
    tournamentId,
    inContext,
    context,
    event,
  } = params;

  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate, eventType, category, gender } = event ?? {};

  const additionalContext = {
    ...context,
    ...definedAttributes({
      surfaceCategory: event.surfaceCategory ?? tournamentRecord?.surfaceCategory,
      indoorOutDoor: event.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
      tournamentId: tournamentId ?? tournamentRecord?.tournamentId,
      endDate: endDate ?? tournamentRecord?.endDate,
      eventName,
      eventType,
      category,
      eventId,
      gender,
    }),
  };

  let groupInfo: undefined | any;
  if (!tournamentParticipants && tournamentRecord) {
    ({
      participants: tournamentParticipants,
      participantMap,
      groupInfo,
    } = hydrateParticipants({
      participantsProfile,
      policyDefinitions,
      useParticipantMap,
      tournamentRecord,
      contextProfile,
      inContext,
    }));
  }

  if (contextProfile && !contextContent)
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      event,
    });

  const publishStatus = getEventPublishStatus({ event });
  const drawDefinitions = event.drawDefinitions ?? [];
  const eventResult = drawDefinitions.reduce((results, drawDefinition) => {
    const drawMatchUpsResult = getDrawMatchUps({
      context: additionalContext,
      tournamentAppliedPolicies,
      scheduleVisibilityFilters,
      tournamentParticipants,
      participantsProfile,
      afterRecoveryTimes,
      policyDefinitions,
      tournamentRecord,
      usePublishState,
      contextContent,
      contextFilters,
      matchUpFilters,
      participantMap,
      publishStatus,
      contextProfile,
      drawDefinition,
      nextMatchUps,
      inContext,
      event,
    });

    const keys = Object.keys(drawMatchUpsResult);
    keys?.forEach((key) => {
      if (Array.isArray(drawMatchUpsResult[key])) {
        if (!results[key]) results[key] = [];
        results[key] = results[key].concat(drawMatchUpsResult[key]);
      }
    });

    return results;
  }, {});

  return { ...eventResult, ...SUCCESS, groupInfo };
}
