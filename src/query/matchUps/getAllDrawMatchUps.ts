import { hydrateParticipants } from '../participants/hydrateParticipants';
import { getContextContent } from '../hierarchical/getContextContent';
import { getAllDrawMatchUps } from './drawMatchUps';

import { GetMatchUpsArgs } from '@Types/factoryTypes';

export function allDrawMatchUps(params: GetMatchUpsArgs) {
  let { participants: tournamentParticipants, participantMap, contextContent } = params;

  const {
    scheduleVisibilityFilters,
    tournamentAppliedPolicies,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    matchUpFilters,
    contextFilters,
    contextProfile,
    drawDefinition,
    nextMatchUps,
    inContext,
    context,
    event,
  } = params;

  const { eventId, eventName, eventType, category, gender, matchUpFormat } = event ?? {};
  const additionalContext = {
    ...context,
    eventId,
    eventType,
    eventName,
    category,
    gender,
    matchUpFormat,
    indoorOutDoor: event?.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
    surfaceCategory: event?.surfaceCategory ?? tournamentRecord?.surfaceCategory,
    endDate: event?.endDate,
  };

  let groupInfo;
  if (!tournamentParticipants?.length && !participantMap && tournamentRecord) {
    ({
      participants: tournamentParticipants = [],
      participantMap,
      groupInfo,
    } = hydrateParticipants({
      participantsProfile,
      useParticipantMap,
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      inContext,
    }));
  }

  if (contextProfile && !contextContent) {
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      drawDefinition,
      event,
    });
  }

  const allDrawMatchUpsResult = getAllDrawMatchUps({
    context: additionalContext,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    contextContent,
    contextFilters,
    contextProfile,
    matchUpFilters,
    participantMap,
    nextMatchUps,
    inContext,
    event,
  });

  return { ...allDrawMatchUpsResult, groupInfo };
}
