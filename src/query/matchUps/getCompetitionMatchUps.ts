import { tournamentMatchUps } from './getTournamentMatchUps';

// constants and types
import { MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { HydratedMatchUp } from '../../types/hydrated';
import {
  GroupInfo,
  MatchUpFilters,
  ParticipantsProfile,
  PolicyDefinitions,
  ResultType,
  ScheduleVisibilityFilters,
  TournamentRecords,
} from '../../types/factoryTypes';

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

export function getCompetitionMatchUps({
  scheduleVisibilityFilters,
  participantsProfile,
  tournamentRecords,
  policyDefinitions,
  usePublishState,
  matchUpFilters,
  contextFilters,
  nextMatchUps,
  inContext,
}: CompetitionMatchUpsArgs): ResultType & {
  abandonedMatchUps?: HydratedMatchUp[];
  completedMatchUps?: HydratedMatchUp[];
  upcomingMatchUps?: HydratedMatchUp[];
  pendingMatchUps?: HydratedMatchUp[];
  byeMatchUps?: HydratedMatchUp[];
  groupInfo?: GroupInfo;
} {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  const tournamentsMatchUps = tournamentIds.map((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    return tournamentMatchUps({
      scheduleVisibilityFilters,
      participantsProfile,
      policyDefinitions,
      tournamentRecord,
      usePublishState,
      matchUpFilters,
      contextFilters,
      nextMatchUps,
      inContext,
    });
  });

  const groupInfo = {};
  const competitionMatchUpsResult = tournamentsMatchUps.reduce((groupings, matchUpGroupings) => {
    const keys = Object.keys(matchUpGroupings);
    keys.forEach((key) => {
      if (Array.isArray(matchUpGroupings[key])) {
        if (!groupings[key]) groupings[key] = [];
        groupings[key] = groupings[key].concat(matchUpGroupings[key]);
      }
      if (key === 'groupInfo') {
        Object.assign(groupInfo, matchUpGroupings[key]);
      }
    });

    return groupings;
  }, {});

  return { ...competitionMatchUpsResult, groupInfo };
}
