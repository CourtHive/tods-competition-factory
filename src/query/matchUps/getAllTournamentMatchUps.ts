import { getAppliedPolicies } from '../extensions/getAppliedPolicies';
import { hydrateParticipants } from '../participants/hydrateParticipants';
import { getContextContent } from '../hierarchical/getContextContent';
import { allEventMatchUps } from './getAllEventMatchUps';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';
import { ResultType } from '../../global/functions/decorateResult';
import { HydratedMatchUp } from '../../types/hydrated';
import { GetMatchUpsArgs } from '../../types/factoryTypes';

export function allTournamentMatchUps(params?: GetMatchUpsArgs): ResultType & {
  matchUps?: HydratedMatchUp[];
} {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  let { participantMap, participants } = params;
  const {
    scheduleVisibilityFilters,
    participantsProfile,
    afterRecoveryTimes,
    useParticipantMap, // will default to true in future release
    policyDefinitions,
    tournamentRecord,
    inContext = true,
    contextProfile,
    matchUpFilters,
    contextFilters,
    nextMatchUps,
    context,
  } = params;

  const tournamentId = params.tournamentId ?? tournamentRecord.tournamentId;
  const events = tournamentRecord?.events ?? [];

  if (!participants) {
    ({ participants, participantMap } = hydrateParticipants({
      participantsProfile,
      useParticipantMap,
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      inContext,
    }));
  }

  const { appliedPolicies: tournamentAppliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });

  const additionalContext: { [key: string]: any } = {
    ...context,
    tournamentId,
    indoorOutDoor: tournamentRecord.indoorOutdoor,
    surfaceCategory: tournamentRecord.surfaceCategory,
    endDate: tournamentRecord.endDate,
  };

  const contextContent = getContextContent({
    policyDefinitions,
    tournamentRecord,
    contextProfile,
  });

  const matchUps = events
    .flatMap((event) => {
      additionalContext.eventDrawsCount = event.drawDefinitions?.length ?? 0;

      return (
        allEventMatchUps({
          context: additionalContext,
          scheduleVisibilityFilters,
          tournamentAppliedPolicies,
          participantsProfile,
          afterRecoveryTimes,
          policyDefinitions,
          tournamentRecord,
          contextContent,
          contextFilters,
          contextProfile,
          matchUpFilters,
          participantMap,
          nextMatchUps,
          participants,
          inContext,
          event,
        }).matchUps ?? []
      );
    })
    // TODO: tournamentRecord.matchUps must be hydrated with participants
    // NOTE: matchUps on the tournamentRecord have no drawPositions; all data apart from participant context must be present
    .concat(...(tournamentRecord.matchUps ?? []));

  return { matchUps };
}
