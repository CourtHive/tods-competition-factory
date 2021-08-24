import { getSchedulingProfile } from '../governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { scheduledSortedMatchUps } from '../../global/sorting/scheduledSortedMatchUps';

import { getVenuesAndCourts } from './venuesAndCourtsGetter';
import {
  allTournamentMatchUps,
  tournamentMatchUps,
} from '../../tournamentEngine/getters/matchUpsGetter';

import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';

export function allCompetitionMatchUps({
  scheduleVisibilityFilters,
  tournamentRecords,
  matchUpFilters,
  contextFilters,
  nextMatchUps,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  const competitionMatchUps = tournamentIds
    .map((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const { matchUps } = allTournamentMatchUps({
        scheduleVisibilityFilters,
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

export function competitionScheduleMatchUps(params) {
  if (
    typeof params?.tournamentRecords !== 'object' ||
    !Object.keys(params?.tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };
  const { courts, venues } = getVenuesAndCourts(params);
  const { sortCourtsData, sortDateMatchUps = true } = params;
  const schedulingProfile = getSchedulingProfile(params).schedulingProfile;

  const { completedMatchUps, upcomingMatchUps, pendingMatchUps } =
    competitionMatchUps(params);

  const relevantMatchUps = [
    ...(upcomingMatchUps || []),
    ...(pendingMatchUps || []),
  ];

  const dateMatchUps = sortDateMatchUps
    ? scheduledSortedMatchUps({ matchUps: relevantMatchUps, schedulingProfile })
    : relevantMatchUps;

  const courtsData = courts.map((court) => {
    const matchUps = getCourtMatchUps(court);
    return {
      ...court,
      matchUps,
      surfaceCategory: court?.surfaceCategory || '',
    };
  });

  return { courtsData, completedMatchUps, dateMatchUps, venues };

  function getCourtMatchUps({ courtId }) {
    const courtMatchUps = dateMatchUps.filter(
      (matchUp) => matchUp.schedule?.courtId === courtId
    );
    return sortCourtsData
      ? scheduledSortedMatchUps({
          matchUps: courtMatchUps,
          schedulingProfile,
        })
      : courtMatchUps;
  }

  /*
  // this was used to float matchUps with checked in participants to the top of the sorted matchUps
  function getFloatValue(matchUp) {
    const allParticipantsCheckedIn = matchUp?.allParticipantsCheckedIn && 100;
    const checkedInParticipantsCount =
      (matchUp?.checkedInParticipantIds?.length || 0) * 10;

    // floatValue ensures that allParticipantsCheckedIn always floats to top as millisecond
    // differences are not always enough to differentiate
    const floatValue = checkedInParticipantsCount + allParticipantsCheckedIn;
    return floatValue;
  }
  */
}

export function competitionMatchUps({
  scheduleVisibilityFilters,
  tournamentRecords,
  matchUpFilters,
  contextFilters,
}) {
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
      tournamentRecord,
      matchUpFilters,
      contextFilters,
    });
  });

  const matchUpGroupings = tournamentsMatchUps.reduce(
    (groupings, matchUpGroupings) => {
      const keys = Object.keys(matchUpGroupings);
      keys.forEach((key) => {
        if (!groupings[key]) groupings[key] = [];
        groupings[key] = groupings[key].concat(matchUpGroupings[key]);
      });

      return groupings;
    },
    {}
  );

  return matchUpGroupings;
}
