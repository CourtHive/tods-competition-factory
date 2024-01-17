import { definedAttributes } from '../../tools/definedAttributes';
import { hydrateParticipants } from '../participants/hydrateParticipants';
import { getContextContent } from '../hierarchical/getContextContent';
import { getDrawMatchUps } from './drawMatchUps';

import { GetMatchUpsArgs } from '../../types/factoryTypes';

export function drawMatchUps({
  participants: tournamentParticipants,
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
  participantsProfile,
  afterRecoveryTimes,
  policyDefinitions,
  useParticipantMap,
  tournamentRecord,
  usePublishState,
  contextFilters,
  contextContent,
  matchUpFilters,
  participantMap,
  publishStatus,
  contextProfile,
  drawDefinition,
  nextMatchUps,
  tournamentId,
  inContext,
  context,
  event,
}: GetMatchUpsArgs) {
  const { eventId, eventName, endDate } = event ?? {};

  const additionalContext = {
    ...context,
    ...definedAttributes({
      eventId,
      eventName,
      endDate: endDate ?? event?.endDate ?? tournamentRecord?.endDate,
      tournamentId: tournamentId ?? tournamentRecord?.tournamentId,
      indoorOutDoor: event?.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
      surfaceCategory: event?.surfaceCategory ?? tournamentRecord?.surfaceCategory,
    }),
  };

  let groupInfo;
  if (!tournamentParticipants?.length && tournamentRecord) {
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

  if (event && contextProfile && !contextContent)
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      drawDefinition,
      event,
    });

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
    participantMap,
    contextContent,
    contextFilters,
    matchUpFilters,
    publishStatus,
    contextProfile,
    drawDefinition,
    nextMatchUps,
    inContext,
    event,
  });

  return { ...drawMatchUpsResult, groupInfo };
}
