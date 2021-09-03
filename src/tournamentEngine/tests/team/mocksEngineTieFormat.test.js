import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { UUID } from '../../../utilities';

it('can generate draws in TEAM events with tieFormat and assign particiapnts to collectionPositions', () => {
  const singlesCollectionId = UUID();
  const doublesCollectionId = UUID();
  const valueGoal = 4;
  const tieFormat = {
    winCriteria: { valueGoal },
    collectionDefinitions: [
      {
        collectionId: doublesCollectionId,
        collectionName: 'Doubles',
        matchUpType: DOUBLES,
        matchUpCount: 2,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpValue: 1,
      },
      {
        collectionId: singlesCollectionId,
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpCount: 5,
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpValue: 1,
      },
    ],
  };

  const drawSize = 8;
  const eventProfiles = [
    {
      eventType: TEAM,
      eventName: 'Test Team Event',
      tieFormat,
      drawProfiles: [
        {
          drawSize,
          tieFormat,
          drawName: 'Main Draw',
        },
      ],
    },
  ];

  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });
  expect(eventId).not.toBeUndefined();
  expect(drawId).not.toBeUndefined();

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  expect(individualParticipants.length).toEqual(40);

  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });
  expect(pairParticipants.length).toEqual(20);

  const { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });
  expect(teamParticipants.length).toEqual(drawSize);

  const { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(event.eventType).toEqual(TEAM);
  expect(drawDefinition.matchUpType).toEqual(TEAM);
  expect(event.entries.length).toEqual(drawSize);
  expect(drawDefinition.entries.length).toEqual(drawSize);
  expect(event.tieFormat).toEqual(tieFormat);
  expect(drawDefinition.tieFormat).toBeUndefined();
});

it('can generate TEAM draws and use tieFormat and assign particiapnts to collectionPositions', () => {
  const singlesCollectionId = UUID();
  const doublesCollectionId = UUID();
  const valueGoal = 4;
  const tieFormat = {
    winCriteria: { valueGoal },
    collectionDefinitions: [
      {
        collectionId: doublesCollectionId,
        collectionName: 'Doubles',
        matchUpType: DOUBLES,
        matchUpCount: 2,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpValue: 1,
      },
      {
        collectionId: singlesCollectionId,
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpCount: 5,
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpValue: 1,
      },
    ],
  };

  const drawSize = 8;
  const drawProfiles = [
    {
      drawSize,
      tieFormat,
      eventType: TEAM,
      drawName: 'Main Draw',
    },
  ];

  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  expect(eventId).not.toBeUndefined();
  expect(drawId).not.toBeUndefined();

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  expect(individualParticipants.length).toEqual(40);

  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });
  expect(pairParticipants.length).toEqual(20);

  const { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });
  expect(teamParticipants.length).toEqual(drawSize);

  const { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(event.eventType).toEqual(TEAM);
  expect(drawDefinition.matchUpType).toEqual(TEAM);
  expect(event.entries.length).toEqual(drawSize);
  expect(drawDefinition.entries.length).toEqual(drawSize);
  expect(event.tieFormat).toEqual(tieFormat);
  expect(drawDefinition.tieFormat).toBeUndefined();
});
