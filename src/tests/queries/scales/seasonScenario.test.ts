import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { completeDrawMatchUps } from '@Generators/mocks/completeDrawMatchUps';
import { tournamentEngine } from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { generateRange } from '@Tools/arrays';
import { addDays } from '@Tools/dateTime';
import { expect, it } from 'vitest';

// Constants
import { ROUND_ROBIN, ROUND_ROBIN_WITH_PLAYOFF } from '@Constants/drawDefinitionConstants';
import { SINGLES_EVENT, TEAM_EVENT } from '@Constants/eventConstants';
import { DIRECT_ACCEPTANCE } from '@Constants/entryStatusConstants';
import { FEMALE, MALE, MIXED } from '@Constants/genderConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';

const displayAggregateResults = false;
const displayTournamentPoints = false;
const displayStandingsTable = false;

const matchUpFormat = 'SET1-S:T30';

const tieFormat = {
  collectionDefinitions: [
    {
      collectionName: 'Male Singles',
      matchUpType: SINGLES,
      matchUpCount: 1,
      matchUpValue: 1,
      matchUpFormat,
      gender: MALE,
    },
    {
      collectionName: 'Female Singles',
      matchUpType: SINGLES,
      matchUpCount: 1,
      matchUpValue: 1,
      gender: FEMALE,
      matchUpFormat,
    },
    {
      collectionName: 'Mixed Doubles',
      matchUpType: DOUBLES,
      matchUpCount: 1,
      matchUpValue: 1,
      gender: MIXED,
      matchUpFormat,
    },
  ],
  winCriteria: { valueGoal: 2 },
};

const scenarios = [
  {
    finishingPositionRangeBounsPoints: { '1-1': 1 },
    participantsPerTeam: 2,
    drawType: ROUND_ROBIN,
    matchUpsCount: 6,
    roundsCount: 1,
    teamsCount: 4,
    drawSize: 4,
  },
  {
    finishingPositionRangeBounsPoints: { '1-1': 2, '2-2': 1 },
    drawType: ROUND_ROBIN_WITH_PLAYOFF,
    structureOptions: { groupSize: 3 },
    participantsPerTeam: 2,
    matchUpsCount: 7,
    roundsCount: 3,
    teamsCount: 6,
    drawSize: 8,
  },
];

const sortResults = (results) =>
  results.sort((a: any, b: any) => {
    return b.standingPoints - a.standingPoints || b.pointsPct - a.pointsPct;
  });

it.each(scenarios.slice(1))('can aggregate team scores across SINGLES/DOUBLES events', (scenario) => {
  const { drawSize, roundsCount, participantsPerTeam } = scenario;
  mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 }, // required to force generation of tieFormat-specific participants
    tournamentName: 'Tournament-1',
    drawProfiles: [
      {
        teamNames: ['A', 'B', 'C', 'D', 'E', 'F'],
        eventType: TEAM_EVENT,
        generate: false,
        addEvent: false,
        tieFormat,
        drawSize,
      },
    ],
    setState: true,
  });

  const result = tournamentEngine.generateEventsFromTieFormat({
    addEntriesFromTeams: true,
    addEvents: true,
    tieFormat,
  });
  expect(result.events.length).toBe(3);

  const teamParticipants = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: ['TEAM'] },
    withIndividualParticipants: true,
  }).participants;

  const events = tournamentEngine.getEvents().events;
  for (const event of events) {
    const { eventType, gender } = event;
    if (eventType === SINGLES_EVENT) continue;
    const participantPairs: string[] = [];
    for (const teamParticipant of teamParticipants) {
      const femaleParticipantIds = teamParticipant.individualParticipants
        .filter((p) => p.person.sex === FEMALE)
        .map((p) => p.participantId);
      const maleParticipantIds = teamParticipant.individualParticipants
        .filter((p) => p.person.sex === MALE)
        .map((p) => p.participantId);
      const individualParticipantIds = (gender === FEMALE && femaleParticipantIds.slice(0, participantsPerTeam)) ||
        (gender === MALE && maleParticipantIds.slice(0, participantsPerTeam)) || [
          ...femaleParticipantIds.slice(0, participantsPerTeam / 2),
          ...maleParticipantIds.slice(0, participantsPerTeam / 2),
        ];
      // for each DOUBLES event create pairings for each TEAM
      participantPairs.push(individualParticipantIds);
    }
    const addResult = tournamentEngine.addEventEntryPairs({
      participantIdPairs: participantPairs,
      entryStatus: DIRECT_ACCEPTANCE,
      eventId: event.eventId,
    });
    expect(addResult.success).toBe(true);
    expect(addResult.addedEntriesCount).toBe(drawSize);
  }

  // const aggregateIndividualResults = {};
  const aggregateTeamResults = {};

  const { structureOptions, drawType, teamsCount, matchUpsCount, finishingPositionRangeBounsPoints } = scenario;
  // Now iterate through the season consistng of drawSize # of tournaments
  generateRange(0, teamsCount * roundsCount).forEach((i) => {
    const events = tournamentEngine.getEvents().events;
    for (const event of events) {
      const { eventId } = event;
      const result = tournamentEngine.generateDrawDefinition({
        drawSize: teamsCount,
        structureOptions,
        drawType,
        eventId,
      });
      expect(result.success).toBe(true);
      const { drawDefinition } = result;
      const completionResult = completeDrawMatchUps({
        completeRoundRobinPlayoffs: true,
        randomWinningSide: true,
        drawDefinition,
        event,
      });
      expect(completionResult.success).toEqual(true);
      if (completionResult.completedCount !== matchUpsCount) {
        console.log(completionResult);
        drawDefinition.structures.forEach((structure) => {
          // condition where groupOrder has not been resolved
          const p = getPositionAssignments({ structure });
          console.log(p.positionAssignments.map((x) => x?.extensions?.[0].value));
        });
      }
      /* RESTORE: expect(completionResult.completedCount).toEqual(matchUpsCount); */
      const addResult = tournamentEngine.addDrawDefinition({ drawDefinition, eventId });
      expect(addResult.success).toEqual(true);
    }

    const { startDate, tournamentName } = tournamentEngine.getTournamentInfo().tournamentInfo;
    const { teamResults } = tournamentEngine.getAggregateTeamResults({
      finishingPositionRangeBounsPoints,
    });

    for (const teamParticipantId of Object.keys(teamResults)) {
      if (!aggregateTeamResults[teamParticipantId]) {
        const teamName = teamResults[teamParticipantId].teamName;
        aggregateTeamResults[teamParticipantId] = {
          standingPoints: 0,
          pointsPlayed: 0,
          pointsPct: 0,
          points: 0,
          teamName,
          bonus: 0,
          diff: 0,
          loss: 0,
          win: 0,
        };
      }
      const { standingPoints, win, loss, points, bonus, diff, pointsPlayed } = teamResults[teamParticipantId];
      aggregateTeamResults[teamParticipantId].standingPoints += standingPoints;
      aggregateTeamResults[teamParticipantId].pointsPlayed += pointsPlayed;
      aggregateTeamResults[teamParticipantId].points += points;
      aggregateTeamResults[teamParticipantId].bonus += bonus;
      aggregateTeamResults[teamParticipantId].diff += diff;
      aggregateTeamResults[teamParticipantId].loss += loss;
      aggregateTeamResults[teamParticipantId].win += win;

      aggregateTeamResults[teamParticipantId].pointsPct = parseFloat(
        (aggregateTeamResults[teamParticipantId].points / aggregateTeamResults[teamParticipantId].pointsPlayed).toFixed(
          2,
        ),
      );
    }

    if (displayTournamentPoints) {
      console.log(tournamentName, sortResults(Object.values(teamResults)));
    }

    if (displayStandingsTable) {
      const teamStandings = sortResults(Object.values(aggregateTeamResults)).map((team) => team.teamName);
      console.log(tournamentName, teamStandings);
    }

    const result = tournamentEngine.copyTournamentRecord({
      tournamentName: `Tournament-${i + 2}`,
      startDate: addDays(startDate, 7),
      copyParticipants: true,
    });
    expect(result.success).toBe(true);

    tournamentEngine.setState(result.tournamentRecord);
  });

  if (displayAggregateResults) {
    console.log('Aggregate Results:', sortResults(Object.values(aggregateTeamResults)));
  }
});
