import {
  allTournamentMatchUps,
  tournamentMatchUps,
} from '../../tournamentEngine/getters/matchUpsGetter/matchUpsGetter';

import { TournamentRecordsArgs } from '../../types/factoryTypes';
import { HydratedMatchUp } from '../../types/hydrated';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';

type CompetitionMatchUpsArgs = TournamentRecordsArgs & {
  scheduleVisibilityFilters?: boolean;
  participantsProfile?: any;
  afterRecoveryTimes?: any;
  policyDefinitions?: any;
  nextMatchUps?: boolean;
  matchUpFilters?: any;
  contextFilters?: any;
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
      const { matchUps } = allTournamentMatchUps({
        scheduleVisibilityFilters,
        afterRecoveryTimes,
        participantsProfile,
        policyDefinitions,
        tournamentRecord,
        matchUpFilters,
        contextFilters,
        nextMatchUps,
      });
      return matchUps;
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
  matchUpFilters,
  contextFilters,
  nextMatchUps,
}: CompetitionMatchUpsArgs) {
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
      matchUpFilters,
      contextFilters,
      nextMatchUps,
    });
  });

  return tournamentsMatchUps.reduce((groupings, matchUpGroupings) => {
    const keys = Object.keys(matchUpGroupings);
    keys.forEach((key) => {
      if (!groupings[key]) groupings[key] = [];
      groupings[key] = groupings[key].concat(matchUpGroupings[key]);
    });

    return groupings;
  }, {});
}
