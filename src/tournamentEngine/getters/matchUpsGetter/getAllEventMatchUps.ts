import { getScheduleTiming } from '../../../query/extensions/matchUpFormatTiming/getScheduleTiming';
import { definedAttributes } from '../../../utilities/definedAttributes';
import { hydrateParticipants } from '../../../query/participants/hydrateParticipants';
import { getContextContent } from '../getContextContent';
import { getAllDrawMatchUps } from '../../../query/drawMatchUps';

import { HydratedMatchUp } from '../../../types/hydrated';
import { GetMatchUpsArgs } from '../../../types/factoryTypes';
import { MISSING_EVENT } from '../../../constants/errorConditionConstants';

export function allEventMatchUps(params: GetMatchUpsArgs) {
  let { participants = [], contextContent, participantMap } = params;
  const {
    scheduleVisibilityFilters,
    tournamentAppliedPolicies,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    contextFilters,
    contextProfile,
    matchUpFilters,
    nextMatchUps,
    inContext,
    context,
    event,
  } = params;
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate, category, gender, matchUpFormat } =
    event;

  const additionalContext = {
    ...context,
    ...definedAttributes({
      indoorOutDoor: event.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
      surfaceCategory:
        event.surfaceCategory ?? tournamentRecord?.surfaceCategory,
      endDate: event.endDate ?? tournamentRecord?.endDate,
      tournamentId: tournamentRecord?.tournamentId,
      matchUpFormat,
      eventName,
      category,
      gender,
      eventId,
    }),
  };
  if (endDate) additionalContext.endDate = endDate;

  if (contextProfile && !contextContent) {
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      event,
    });
  }

  let groupInfo;
  if (!participants?.length && !participantMap && tournamentRecord) {
    const hydratedParticipantResult = hydrateParticipants({
      participantsProfile,
      useParticipantMap,
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      inContext,
    });
    participantMap = hydratedParticipantResult.participantMap;
    participants = hydratedParticipantResult.participants ?? [];
    groupInfo = hydratedParticipantResult.groupInfo;
  }

  const drawDefinitions = event.drawDefinitions ?? [];
  const scheduleTiming = getScheduleTiming({
    tournamentRecord,
    event,
  }).scheduleTiming;

  const matchUps: HydratedMatchUp[] = drawDefinitions.flatMap(
    (drawDefinition) => {
      const { matchUps } = getAllDrawMatchUps({
        tournamentParticipants: participants,
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
        context: additionalContext,
        participantsProfile,
        afterRecoveryTimes,
        policyDefinitions,
        tournamentRecord,
        contextFilters,
        contextProfile,
        drawDefinition,
        contextContent,
        matchUpFilters,
        participantMap,
        scheduleTiming,
        nextMatchUps,
        inContext,
        event,
      });

      return matchUps ?? [];
    }
  );

  return { matchUps, groupInfo };
}
