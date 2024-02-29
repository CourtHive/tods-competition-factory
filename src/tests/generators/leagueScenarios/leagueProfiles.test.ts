import { mocksEngine } from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants
import { COLLEGE_DEFAULT } from '@Constants/tieFormatConstants';
import { MALE } from '@Constants/genderConstants';
import { TEAM } from '@Constants/participantConstants';

it('can generate Teams and venues from leagueProfiles', () => {
  const startDate = '2022-01-01';
  const endDate = '2022-04-31'; // four months for league
  const leagueProfiles = [
    {
      daysOfWeek: ['Tuesday', 'Saturday'],
      tieFormatName: COLLEGE_DEFAULT,
      leagueName: 'NTRP 3.5 Men', // || eventName
      leagueId: 'leagueId', // optional
      teamProfiles: [
        { teamName: 'Team 1 M', venueIds: ['venue1'] },
        { teamName: 'Team 2 M', venueIds: ['venue2'] },
        { teamName: 'Team 3 M', venueIds: ['venue3'] },
        { teamName: 'Team 4 M', venueIds: ['venue4'] },
        { teamName: 'Team 5 M', venueIds: ['venue5'] },
        { teamName: 'Team 6 M', venueIds: ['venue6'] },
        { teamName: 'Team 7 M', venueIds: ['venue7'] },
        { teamName: 'Team 8 M', venueIds: ['venue8'] },
      ],
      category: undefined, // optional
      teamsCount: 8, // implies 7 rounds of play; only requires 3.5 weeks to complete given 2 matches per week
      roundsCount: 7, // optional, will default to ROUND_ROBIN; can specify DOUBLE_ROUND_ROBIN
      automated: true,
      gender: MALE,
    },
    {
      daysOfWeek: ['Wednesday', 'Saturday'],
      tieFormatName: COLLEGE_DEFAULT,
      leagueName: 'NTRP 3.5 Women',
      teamProfiles: [
        { teamName: 'Team 1 W', venueIds: ['venue1'] },
        { teamName: 'Team 2 W', venueIds: ['venue2'] },
        { teamName: 'Team 3 W', venueIds: ['venue3'] },
        { teamName: 'Team 4 W', venueIds: ['venue4'] },
        { teamName: 'Team 5 W', venueIds: ['venue5'] },
        { teamName: 'Team 6 W', venueIds: ['venue6'] },
        { teamName: 'Team 7 W', venueIds: ['venue7'] },
        { teamName: 'Team 8 W', venueIds: ['venue8'] },
      ],
      teamsCount: 8,
      gender: MALE,
    },
    {
      daysOfWeek: ['Tuesday', 'Sunday'],
      tieFormatName: COLLEGE_DEFAULT,
      leagueName: 'NTRP 3.0 Women',
      endDate: '2022-5-30',
      teamsCount: 8,
      gender: MALE,
    },
  ];

  mocksEngine.generateTournamentRecord({ startDate, endDate, leagueProfiles, setState: true });

  const participants = tournamentEngine.getParticipants().participants;
  expect(participants).toBeDefined();

  const tournamentRecord = tournamentEngine.getTournament().tournamentRecord;
  expect(tournamentRecord.events.length).toEqual(leagueProfiles.length);

  const teamParticipants = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [TEAM] },
  }).participants;

  expect(teamParticipants.length).toEqual(
    leagueProfiles.reduce(
      (count, profile) => count + Math.max(profile.teamsCount ?? 0, profile.teamProfiles?.length ?? 0),
      0,
    ),
  );

  expect(teamParticipants[0].individualParticipantIds.length).toEqual(6); // derived from tieFormat

  // TODO: generate multiple tournaments, extract league events and schedule them across shared resources
});
