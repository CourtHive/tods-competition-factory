import {
  allTournamentMatchUps,
  tournamentMatchUps,
} from '../../tournamentEngine/getters/matchUpsGetter/matchUpsGetter';

import { MatchUpFilters } from '../../query/filterMatchUps';
import { ResultType } from '../../global/functions/decorateResult';
import { HydratedMatchUp } from '../../types/hydrated';
import {
  GroupInfo,
  ParticipantsProfile,
  PolicyDefinitions,
  ScheduleVisibilityFilters,
  TournamentRecords,
} from '../../types/factoryTypes';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';

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
  matchUpFilters,
  contextFilters,
  nextMatchUps,
  inContext,
}: CompetitionMatchUpsArgs): {
  matchUps?: HydratedMatchUp[];
  error?: ErrorType;
} {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
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
          matchUpFilters,
          contextFilters,
          nextMatchUps,
          inContext,
        }).matchUps ?? []
      );
    })
    .flat();

  return { matchUps: competitionMatchUps };
}

// this was used to float matchUps with checked in participants to the top of the sorted matchUps
export function getFloatValue(matchUp) {
  const allParticipantsCheckedIn = matchUp?.allParticipantsCheckedIn && 100;
  const checkedInParticipantsCount =
    (matchUp?.checkedInParticipantIds?.length || 0) * 10;

  // floatValue ensures that allParticipantsCheckedIn always floats to top as millisecond
  // differences are not always enough to differentiate
  return checkedInParticipantsCount + allParticipantsCheckedIn;
}

export function competitionMatchUps({
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
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
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
  const competitionMatchUpsResult = tournamentsMatchUps.reduce(
    (groupings, matchUpGroupings) => {
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
    },
    {}
  );

  return { ...competitionMatchUpsResult, groupInfo };
}
