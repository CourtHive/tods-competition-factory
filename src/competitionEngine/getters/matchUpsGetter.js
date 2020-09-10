import { getVenuesAndCourts } from './venuesAndCourtsGetter';

export function allCompetitionMatchUps({
  tournamentRecords,
  tournamentEngine,
  matchUpFilters,
  contextFilters,
}) {
  if (!tournamentRecords) return { error: 'Missing tournamentRecords' };

  const tournamentIds = Object.keys(tournamentRecords);
  const competitionMatchUps = tournamentIds
    .map(tournamentId => {
      const tournamentRecord = tournamentRecords[tournamentId];
      return tournamentEngine
        .setState(tournamentRecord)
        .allTournamentMatchUps({ matchUpFilters, contextFilters });
    })
    .flat();

  return competitionMatchUps;
}

export function competitionScheduleMatchUps(props) {
  const { courts, venues } = getVenuesAndCourts(props);
  const {
    completedMatchUps,
    upcomingMatchUps,
    pendingMatchUps,
  } = competitionMatchUps(props);
  const dateMatchUps = [
    ...(upcomingMatchUps || []),
    ...(pendingMatchUps || []),
  ].sort((a, b) => getTime(a) - getTime(b));

  const courtsData = courts.map(court => {
    const matchUps = getCourtMatchUps(court.courtId);
    return {
      ...court,
      matchUps,
      surfaceCategory: court?.surfaceCategory || '',
    };
  });

  return { courtsData, completedMatchUps, dateMatchUps, venues };

  function getCourtMatchUps(courtId) {
    return dateMatchUps
      .filter(matchUp => matchUp.schedule?.courtId === courtId)
      .sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      );
  }

  function getTime(matchUp) {
    const scheduledTime = matchUp?.schedule?.scheduledTime;
    const allParticipantsCheckedIn = matchUp?.allParticipantsCheckedIn && 100;
    const checkedInParticipantsCount =
      (matchUp?.checkedInParticipantIds?.length || 0) * 10;

    // floatValue insures that allParticipantsCheckedIn always floats to top as millisecond
    // differences are not always enough to differentiate
    const floatValue = checkedInParticipantsCount + allParticipantsCheckedIn;

    return !scheduledTime ? 0 : new Date(scheduledTime).getTime() - floatValue;
  }
}

export function competitionMatchUps({
  tournamentRecords,
  tournamentEngine,
  matchUpFilters,
  contextFilters,
}) {
  if (!tournamentRecords) return { error: 'Missing tournamentRecords' };

  const tournamentIds = Object.keys(tournamentRecords);
  const tournamentsMatchUps = tournamentIds.map(tournamentId => {
    const tournamentRecord = tournamentRecords[tournamentId];
    return tournamentEngine
      .setState(tournamentRecord)
      .tournamentMatchUps({ matchUpFilters, contextFilters });
  });

  const matchUpGroupings = tournamentsMatchUps.reduce(
    (groupings, tournamentMatchUps) => {
      const keys = Object.keys(tournamentMatchUps);
      keys.forEach(key => {
        if (!groupings[key]) groupings[key] = [];
        groupings[key] = groupings[key].concat(tournamentMatchUps[key]);
      });

      return groupings;
    },
    {}
  );

  return matchUpGroupings;
}
