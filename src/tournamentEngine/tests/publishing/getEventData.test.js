import fs from 'fs';
import tournamentEngine from '../..';
import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';

import {
  COMPASS,
  CONTAINER,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
  PLAY_OFF,
  ROUND_ROBIN_WITH_PLAYOFF,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { ROUND_NAMING_POLICY } from './roundNamingPolicy';
import { PARTICIPANT_PRIVACY_DEFAULT } from '../../../fixtures/participants/PARTICIPANT_POLICY_DEFAULT';
import { PUBLIC } from '../../../constants/timeItemConstants';

it('can generate payload for publishing a Round Robin with Playoffs', () => {
  const drawSize = 16;
  const groupSize = 4;
  const groupsCount = drawSize / groupSize;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  const playoffStructuresCount = 4;
  const structureOptions = {
    groupSize,
    playoffGroups: [
      { finishingPositions: [1], structureName: 'Gold Flight' },
      { finishingPositions: [2], structureName: 'Silver Flight' },
      { finishingPositions: [3], structureName: 'Bronze Flight' },
      { finishingPositions: [4], structureName: 'Green Flight' },
    ],
  };

  const { tournamentRecord, participants } = generateTournamentWithParticipants(
    {
      participantsCount: drawSize,
    }
  );
  tournamentEngine.setState(tournamentRecord);

  const venueName = 'GrassHaven';
  const myCourts = { venueName };
  let result = tournamentEngine.addVenue({ venue: myCourts });
  expect(result.success).toEqual(true);
  const { venueId } = result.venue;

  const eventName = 'Round Robin w/ Playoffs';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  const venueAbbreviation = 'GHC';
  const modifications = {
    venueAbbreviation,
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
      {
        courtId: '886068ac-c176-4cd6-be96-768fa895d0c1',
        courtName: 'Custom Court 2',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };
  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addEvent({ event });
  const { event: createdEvent, success } = result;
  const { eventId } = createdEvent;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const matchUpFormat = 'SET3-S:6/TB7';
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawType,
    drawSize,
    matchUpFormat,
    structureOptions,
    seedingProfile: WATERFALL,
  });

  expect(drawDefinition.links.length).toEqual(playoffStructuresCount);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN
  );

  expect(mainStructure.structures.length).toEqual(groupsCount);
  expect(mainStructure.structures[0].positionAssignments.length).toEqual(4);

  const playoffStructures = drawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAY_OFF
        ? structures.concat(structure)
        : structures;
    },
    []
  );

  expect(playoffStructures.length).toEqual(4);
  expect(playoffStructures[0].positionAssignments.length).toEqual(4);

  const policyDefinition = Object.assign(
    {},
    ROUND_NAMING_POLICY,
    PARTICIPANT_PRIVACY_DEFAULT
  );

  const { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    eventId,
    policyDefinition,
  });
  expect(publishSuccess).toEqual(true);
  expect(eventData.eventInfo.publish.state[PUBLIC].drawIds).toEqual([]);

  expect(eventData.eventInfo.eventId).toEqual(eventId);
  expect(eventData.eventInfo.eventName).toEqual(eventName);

  expect(eventData.tournamentInfo.tournamentId).toEqual(
    tournamentRecord.tournamentId
  );

  expect(eventData.venuesData[0].venueId).toEqual(venueId);
  expect(eventData.venuesData[0].venueName).toEqual(venueName);
  expect(eventData.venuesData[0].venueAbbreviation).toEqual(venueAbbreviation);
  expect(eventData.venuesData[0].courtsInfo.length).toEqual(2);

  expect(eventData.drawsData[0].drawId).toEqual(drawDefinition.drawId);
  expect(eventData.drawsData[0].structures.length).toEqual(5);

  const main = eventData.drawsData[0].structures.find(
    (structure) => structure.stage === 'MAIN'
  );
  expect(main.structureType).toEqual(CONTAINER);

  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].drawId
  ).toEqual(drawDefinition.drawId);

  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].eventId
  ).toEqual(eventId);

  // round naming policy test
  expect(
    eventData.drawsData[0].structures[1].roundMatchUps[1][0].roundName
  ).toEqual('P-Semifinals');

  const structureNames = main.roundMatchUps[1].reduce((names, matchUp) => {
    return names.includes(matchUp.structureName)
      ? names
      : names.concat(matchUp.structureName);
  }, []);
  expect(structureNames).toEqual(['Group 1', 'Group 2', 'Group 3', 'Group 4']);

  const writeFile = process.env.TMX_TEST_FILES;
  const fileName = `eventData.json`;
  const dirPath = './src/tournamentEngine/tests/publishing/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(eventData, undefined, 2));
});

it('can generate payload for publishing a compass draw', () => {
  const drawSize = 16;
  const drawType = COMPASS;

  const { tournamentRecord, participants } = generateTournamentWithParticipants(
    {
      participantsCount: drawSize,
    }
  );
  tournamentEngine.setState(tournamentRecord);

  const venueName = 'GrassHaven';
  const myCourts = { venueName };
  let result = tournamentEngine.addVenue({ venue: myCourts });
  expect(result.success).toEqual(true);
  const { venueId } = result.venue;

  const eventName = 'CourtHive Compass';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  const venueAbbreviation = 'CCC';
  const modifications = {
    venueAbbreviation,
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
      {
        courtId: '886068ac-c176-4cd6-be96-768fa895d0c1',
        courtName: 'Custom Court 2',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };
  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addEvent({ event });
  const { event: createdEvent, success } = result;
  const { eventId } = createdEvent;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const matchUpFormat = 'SET3-S:6/TB7';
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawType,
    drawSize,
    matchUpFormat,
  });

  expect(drawDefinition.links.length).toEqual(7);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1
  );
  expect(mainStructure.structureName).toEqual('EAST');

  const policyDefinition = Object.assign(
    {},
    ROUND_NAMING_POLICY,
    PARTICIPANT_PRIVACY_DEFAULT
  );

  const { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    eventId,
    policyDefinition,
  });
  expect(publishSuccess).toEqual(true);
  expect(eventData.eventInfo.publish.state[PUBLIC].structureIds).toEqual([]);

  expect(eventData.eventInfo.eventId).toEqual(eventId);
  expect(eventData.eventInfo.eventName).toEqual(eventName);

  expect(eventData.tournamentInfo.tournamentId).toEqual(
    tournamentRecord.tournamentId
  );

  expect(eventData.venuesData[0].venueId).toEqual(venueId);
  expect(eventData.venuesData[0].venueName).toEqual(venueName);
  expect(eventData.venuesData[0].venueAbbreviation).toEqual(venueAbbreviation);
  expect(eventData.venuesData[0].courtsInfo.length).toEqual(2);

  expect(eventData.drawsData[0].drawId).toEqual(drawDefinition.drawId);
  expect(eventData.drawsData[0].structures.length).toEqual(8);

  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].drawId
  ).toEqual(drawDefinition.drawId);

  // round naming policy test
  expect(
    eventData.drawsData[0].structures[1].roundMatchUps[1][0].roundName
  ).toEqual('S-Semifinals');

  const writeFile = process.env.TMX_TEST_FILES;
  const fileName = `eventData.json`;
  const dirPath = './src/tournamentEngine/tests/publishing/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(eventData, undefined, 2));
});

it('can generate payload for publishing a FMLC draw', () => {
  const drawSize = 16;
  const drawType = FIRST_MATCH_LOSER_CONSOLATION;

  const { tournamentRecord, participants } = generateTournamentWithParticipants(
    {
      participantsCount: drawSize,
    }
  );
  tournamentEngine.setState(tournamentRecord);

  const venueName = 'GrassHaven';
  const myCourts = { venueName };
  let result = tournamentEngine.addVenue({ venue: myCourts });
  expect(result.success).toEqual(true);
  const { venueId } = result.venue;

  const eventName = 'CourtHive Compass';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  const venueAbbreviation = 'CCC';
  const modifications = {
    venueAbbreviation,
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
      {
        courtId: '886068ac-c176-4cd6-be96-768fa895d0c1',
        courtName: 'Custom Court 2',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };
  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addEvent({ event });
  const { event: createdEvent, success } = result;
  const { eventId } = createdEvent;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const matchUpFormat = 'SET3-S:6/TB7';
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawType,
    drawSize,
    matchUpFormat,
  });

  expect(drawDefinition.links.length).toEqual(2);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1
  );
  expect(mainStructure.structureName).toEqual('MAIN');

  const policyDefinition = Object.assign(
    {},
    ROUND_NAMING_POLICY,
    PARTICIPANT_PRIVACY_DEFAULT
  );

  const { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    eventId,
    policyDefinition,
  });
  expect(publishSuccess).toEqual(true);
  expect(eventData.eventInfo.publish.state[PUBLIC].drawIds).toEqual([]);

  expect(eventData.eventInfo.eventId).toEqual(eventId);
  expect(eventData.eventInfo.eventName).toEqual(eventName);

  expect(eventData.tournamentInfo.tournamentId).toEqual(
    tournamentRecord.tournamentId
  );

  expect(eventData.venuesData[0].venueId).toEqual(venueId);
  expect(eventData.venuesData[0].venueName).toEqual(venueName);
  expect(eventData.venuesData[0].venueAbbreviation).toEqual(venueAbbreviation);
  expect(eventData.venuesData[0].courtsInfo.length).toEqual(2);

  expect(eventData.drawsData[0].drawId).toEqual(drawDefinition.drawId);
  expect(eventData.drawsData[0].structures.length).toEqual(2);

  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].drawId
  ).toEqual(drawDefinition.drawId);

  // round naming policy test
  expect(
    eventData.drawsData[0].structures[1].roundMatchUps[1][0].roundName
  ).toEqual('C-Quarterfinals');

  expect(
    eventData.drawsData[0].structures[1].roundMatchUps[1][0].sides[0]
      .sourceDrawPositionRange
  ).not.toBeUndefined();

  const writeFile = process.env.TMX_TEST_FILES;
  const fileName = `eventData.json`;
  const dirPath = './src/tournamentEngine/tests/publishing/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(eventData, undefined, 2));
});
