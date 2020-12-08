import drawEngine from '../../../drawEngine';
import tournamentEngine from '../..';
import { tournamentRecordWithParticipants } from '../primitives';

import {
  MAIN,
  PLAY_OFF,
  POSITION,
  ROUND_ROBIN_WITH_PLAYOFF,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';

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

  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    participantsCount: drawSize,
  });
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

  const participantIds = participants.map(p => p.participantId);
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
    structure => structure.stage === MAIN
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

  const playoffStructureIds = playoffStructures.map(
    structure => structure.structureId
  );

  const payload = tournamentEngine.getEventData({
    eventId,
  });

  console.log(payload);
  expect(payload.eventInfo.eventId).toEqual(eventId);
  expect(payload.eventInfo.eventName).toEqual(eventName);

  expect(payload.tournamentInfo.tournamentId).toEqual(
    tournamentRecord.tournamentId
  );

  expect(payload.venuesData[0].venueId).toEqual(venueId);
  expect(payload.venuesData[0].venueName).toEqual(venueName);
  expect(payload.venuesData[0].venueAbbreviation).toEqual(venueAbbreviation);
  expect(payload.venuesData[0].courtsInfo.length).toEqual(2);

  expect(payload.drawsData[0].drawId).toEqual(drawDefinition.drawId);
  expect(payload.drawsData[0].groupedStructures.length).toEqual(1);
  expect(payload.drawsData[0].groupedStructures[0].length).toEqual(5);
});
