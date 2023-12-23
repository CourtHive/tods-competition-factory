import { getAppliedPolicies } from '../extensions/getAppliedPolicies';
import { hydrateParticipants } from '../participants/hydrateParticipants';
import { getContextContent } from '../hierarchical/getContextContent';
import { getFlightProfile } from '../event/getFlightProfile';

import {
  GetMatchUpsArgs,
  GroupsMatchUpsResult,
} from '../../types/factoryTypes';
import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';
import { eventMatchUps } from './getEventMatchUps';

export function tournamentMatchUps(
  params: GetMatchUpsArgs
): GroupsMatchUpsResult {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  let contextContent = params.contextContent;
  const {
    scheduleVisibilityFilters,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    inContext = true,
    usePublishState,
    contextFilters,
    matchUpFilters,
    contextProfile,
    nextMatchUps,
    context,
  } = params;
  const tournamentId = params.tournamentId ?? tournamentRecord.tournamentId;
  const events = tournamentRecord?.events ?? [];

  const { participants, participantMap, groupInfo } = hydrateParticipants({
    participantsProfile,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    contextProfile,
    inContext,
  });

  if (contextProfile && !contextContent)
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
    });

  const { appliedPolicies: tournamentAppliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });
  const filteredEventIds = contextFilters?.eventIds ?? [];
  const eventsDrawsMatchUps = events
    .filter((event) => !filteredEventIds.includes(event.eventId))
    .map((event) => {
      const flightProfile = getFlightProfile({ event }).flightProfile;
      const additionalContext = {
        eventDrawsCount:
          flightProfile?.flights?.length || event.drawDefinitions?.length || 0,
        ...context,
      };

      return eventMatchUps({
        context: additionalContext,
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
        participantsProfile,
        afterRecoveryTimes,
        policyDefinitions,
        tournamentRecord,
        usePublishState,
        contextFilters,
        contextProfile,
        contextContent,
        matchUpFilters,
        participantMap,
        participants,
        tournamentId,
        nextMatchUps,
        inContext,
        event,
      });
    });

  const eventsDrawMatchUpsResult = eventsDrawsMatchUps.reduce(
    (matchUps, eventMatchUps) => {
      const keys =
        eventMatchUps &&
        Object.keys(eventMatchUps).filter(
          (key) => !['success', 'matchUpsMap'].includes(key)
        );
      keys?.forEach((key) => {
        if (Array.isArray(eventMatchUps[key])) {
          if (!matchUps[key]) matchUps[key] = [];
          matchUps[key] = matchUps[key].concat(eventMatchUps[key]);
          matchUps.matchUpsCount += eventMatchUps[key].length;
        }
      });

      return matchUps;
    },
    { matchUpsCount: 0 }
  );

  return { ...eventsDrawMatchUpsResult, groupInfo };
}
