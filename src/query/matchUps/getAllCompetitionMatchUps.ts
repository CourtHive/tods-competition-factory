import { allTournamentMatchUps } from './getAllTournamentMatchUps';

// constants and types
import { ErrorType, MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import {
  MatchUpFilters,
  ParticipantsProfile,
  PolicyDefinitions,
  ScheduleVisibilityFilters,
  TournamentRecords,
} from '@Types/factoryTypes';

type CompetitionMatchUpsArgs = {
  scheduleVisibilityFilters?: ScheduleVisibilityFilters;
  participantsProfile?: ParticipantsProfile;
  tournamentRecords: TournamentRecords;
  policyDefinitions?: PolicyDefinitions;
  matchUpFilters?: MatchUpFilters;
  contextFilters?: MatchUpFilters;
  afterRecoveryTimes?: boolean;
  usePublishState?: boolean;
  nextMatchUps?: boolean;
  inContext?: boolean;
};

export function allCompetitionMatchUps({
  scheduleVisibilityFilters,
  afterRecoveryTimes,
  participantsProfile,
  tournamentRecords,
  policyDefinitions,
  usePublishState,
  matchUpFilters,
  contextFilters,
  nextMatchUps,
  inContext,
}: CompetitionMatchUpsArgs): {
  matchUps?: HydratedMatchUp[];
  error?: ErrorType;
} {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  const competitionMatchUps: HydratedMatchUp[] = tournamentIds
    .map((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      return (
        allTournamentMatchUps({
          scheduleVisibilityFilters,
          afterRecoveryTimes,
          participantsProfile,
          policyDefinitions,
          tournamentRecord,
          usePublishState,
          matchUpFilters,
          contextFilters,
          nextMatchUps,
          inContext,
        }).matchUps ?? []
      );
    })
    .flat();

  return { ...SUCCESS, matchUps: competitionMatchUps };
}
