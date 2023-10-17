import { constantToString } from '../../../utilities/strings';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import PARTICIPANT_PRIVACY_DEFAULT from '../../../fixtures/policies/POLICY_PRIVACY_DEFAULT';
import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { INDIVIDUAL } from '../../../constants/participantConstants';
import { PUBLIC } from '../../../constants/timeItemConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import { ROUND_NAMING_POLICY } from './roundNamingPolicy';
import {
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import {
  COMPASS,
  CONTAINER,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
  ROUND_ROBIN_WITH_PLAYOFF,
  VOLUNTARY_CONSOLATION,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';

const startDate = '2021-01-01';
const endDate = '2021-01-02';

const court1 = {
  courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
  courtName: 'Custom Court 1',
};
const court2 = {
  courtId: '886068ac-c176-4cd6-be96-768fa895d0c1',
  courtName: 'Custom Court 2',
};

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

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: drawSize },
  });
  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const venueName = 'GrassHaven';
  const myCourts = { venueName };
  let result = tournamentEngine
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
  expect(result.success).toEqual(true);
  const { venueId } = result.venue;

  const eventName = 'Round Robin w/ Playoffs';
  const event = {
    eventType: SINGLES,
    eventName,
  };

  const venueAbbreviation = 'GHC';
  const modifications = {
    venueAbbreviation,
    courts: [
      {
        ...court1,
        dateAvailability: [
          {
            startTime: '16:30',
            endTime: '17:30',
            date: startDate,
          },
          {
            startTime: '16:30',
            endTime: '17:30',
            date: endDate,
          },
        ],
      },
      {
        ...court2,
        dateAvailability: [
          {
            startTime: '16:30',
            endTime: '17:30',
            date: startDate,
          },
          {
            startTime: '16:30',
            endTime: '17:30',
            date: endDate,
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
  expect(result.success).toEqual(true);

  const matchUpFormat = FORMAT_STANDARD;
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    seedingProfile: { positioning: WATERFALL },
    structureOptions,
    matchUpFormat,
    drawType,
    drawSize,
    eventId,
  });

  expect(drawDefinition.links.length).toEqual(playoffStructuresCount);

  const { drawId } = drawDefinition;
  result = tournamentEngine.addDrawDefinition({ drawDefinition });
  expect(result.error).toEqual(MISSING_EVENT);
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

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

  const policyDefinitions = {
    ...PARTICIPANT_PRIVACY_DEFAULT,
    ...ROUND_NAMING_POLICY,
  };

  result = tournamentEngine.publishEvent({ policyDefinitions });
  expect(result.error).toEqual(MISSING_EVENT);

  const { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    policyDefinitions,
    eventId,
  });
  expect(publishSuccess).toEqual(true);
  expect(eventData.eventInfo.publish.state[PUBLIC].drawIds).toEqual([drawId]);

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

  result = tournamentEngine.deleteDrawDefinitions({
    drawIds: [drawId],
    eventId,
  });
  expect(result.success).toEqual(true);
});

it('can generate payload for publishing a compass draw', () => {
  const drawSize = 16;
  const drawType = COMPASS;

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: drawSize },
  });
  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const venueName = 'GrassHaven';
  const myCourts = { venueName };
  let result = tournamentEngine
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
  expect(result.success).toEqual(true);
  const { venueId } = result.venue;

  const eventName = 'CourtHive Compass';
  const event = {
    eventType: SINGLES,
    eventName,
  };

  const venueAbbreviation = 'CCC';
  const modifications = {
    venueAbbreviation,
    courts: [
      {
        ...court1,
        dateAvailability: [
          {
            startTime: '16:30',
            endTime: '17:30',
            date: startDate,
          },
          {
            startTime: '16:30',
            endTime: '17:30',
            date: endDate,
          },
        ],
      },
      {
        ...court2,
        dateAvailability: [
          {
            startTime: '16:30',
            endTime: '17:30',
            date: startDate,
          },
          {
            startTime: '16:30',
            endTime: '17:30',
            date: endDate,
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
  expect(result.success).toEqual(true);

  const matchUpFormat = FORMAT_STANDARD;
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawType,
    drawSize,
    matchUpFormat,
  });

  expect(drawDefinition.links.length).toEqual(7);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1
  );
  expect(mainStructure.structureName).toEqual('EAST');

  const policyDefinitions = {
    ...PARTICIPANT_PRIVACY_DEFAULT,
    ...ROUND_NAMING_POLICY,
  };

  const { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    policyDefinitions,
    eventId,
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
  ).toEqual('W-Quarterfinals');
});

it('can generate payload for publishing a FIRST_MATCH_LOSER_CONSOLATION draw', () => {
  const drawSize = 16;
  const drawType = FIRST_MATCH_LOSER_CONSOLATION;

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: drawSize },
  });
  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const venueName = 'GrassHaven';
  const myCourts = { venueName };
  let result = tournamentEngine
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
  expect(result.success).toEqual(true);
  const { venueId } = result.venue;

  const eventName = 'CourtHive Compass';
  const event = {
    eventType: SINGLES,
    eventName,
  };

  const venueAbbreviation = 'CCC';
  const modifications = {
    venueAbbreviation,
    courts: [
      {
        ...court1,
        dateAvailability: [
          {
            date: startDate,
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: endDate,
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
      {
        ...court2,
        dateAvailability: [
          {
            date: startDate,
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: endDate,
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
  expect(result.success).toEqual(true);

  const matchUpFormat = FORMAT_STANDARD;
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawType,
    drawSize,
    matchUpFormat,
  });

  expect(drawDefinition.links.length).toEqual(2);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1
  );
  expect(mainStructure.structureName).toEqual(constantToString(MAIN));

  const policyDefinitions = {
    ...PARTICIPANT_PRIVACY_DEFAULT,
    ...ROUND_NAMING_POLICY,
  };

  const { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    policyDefinitions,
    eventId,
  });
  expect(publishSuccess).toEqual(true);

  const { drawId } = drawDefinition;
  expect(eventData.eventInfo.publish.state[PUBLIC].drawIds).toEqual([drawId]);

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
  ).toEqual('C-Quarterfinals-Q');

  expect(
    eventData.drawsData[0].structures[1].roundMatchUps[1][0].sides[0]
      .sourceDrawPositionRange
  ).not.toBeUndefined();

  result = tournamentEngine.bulkUpdatePublishedEventIds();
  expect(result.error).toEqual(MISSING_VALUE);
  result = tournamentEngine.bulkUpdatePublishedEventIds({ outcomes: [] });
  expect(result.error).toEqual(MISSING_VALUE);
  result = tournamentEngine.bulkUpdatePublishedEventIds({ outcomes: [{}] });
  expect(result.publishedEventIds).toEqual([]);
  expect(result.eventIdPublishedDrawIdsMap).toEqual({});
  result = tournamentEngine.bulkUpdatePublishedEventIds({
    outcomes: [{ eventId, drawId }],
  });
  expect(result.publishedEventIds).toEqual([eventId]);
  expect(result.eventIdPublishedDrawIdsMap).toEqual({ [eventId]: [drawId] });
});

it('can filter out unPublished draws when publishing event', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
  const { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  const { flightProfile } = tournamentEngine.generateFlightProfile({
    attachFlightProfile: true,
    flightsCount: 3,
    eventId,
  });

  flightProfile.flights?.forEach((flight) => {
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      drawEntries: flight.drawEntries,
      drawId: flight.drawId,
      eventId,
    });
    result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
    expect(result.success).toEqual(true);
  });

  const drawIds = flightProfile.flights.map(({ drawId }) => drawId);
  const policyDefinitions = {
    ...PARTICIPANT_PRIVACY_DEFAULT,
    ...ROUND_NAMING_POLICY,
  };

  const drawId = drawIds[0];
  const { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    policyDefinitions,
    drawIds: [drawId],
    eventId,
  });
  expect(publishSuccess).toEqual(true);
  expect(eventData.eventInfo.publish.state[PUBLIC].drawIds).toEqual([drawId]);

  result = tournamentEngine.unPublishEvent();
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.unPublishEvent({ eventId });
  expect(result.success).toEqual(true);
});

it('can add or remove drawIds from a published event', () => {
  const eventId = 'event1';
  const eventProfiles = [
    {
      eventId,
      drawProfiles: [
        { drawSize: 8, drawId: 'draw1', drawType: ROUND_ROBIN_WITH_PLAYOFF },
        { drawSize: 8, drawId: 'draw2', drawType: FEED_IN_CHAMPIONSHIP },
        {
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
          drawId: 'draw3',
          drawSize: 8,
        },
      ],
    },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const policyDefinitions = {
    ...PARTICIPANT_PRIVACY_DEFAULT,
    ...ROUND_NAMING_POLICY,
  };

  let { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    drawIds: ['draw1', 'draw2'],
    policyDefinitions,
    eventId,
  });
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData.length).toEqual(2);
  const secondStructureId = eventData.drawsData[0].structures[1].structureId;

  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    structureIds: [secondStructureId],
    drawIds: ['draw1', 'draw2'],
    policyDefinitions,
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData.length).toEqual(1);

  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    drawIdsToAdd: ['draw3'],
    policyDefinitions,
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData.length).toEqual(3);

  // attempt to add a drawId that is already there
  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    drawIdsToAdd: ['draw1'],
    policyDefinitions,
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData.length).toEqual(3);

  // remove a drawId
  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    drawIdsToRemove: ['draw1'],
    policyDefinitions,
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData.length).toEqual(2);
});

it('can add or remove stages from a published draw', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 16,
        qualifyingProfiles: [
          {
            structureProfiles: [
              {
                qualifyingPositions: 4,
                drawSize: 8,
              },
            ],
          },
        ],
      },
    ],
    completeAllMatchUps: true,
  });

  let result = tournamentEngine.devContext(true).setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { eligibleParticipants } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      matchUpsLimit: 1,
      drawId,
    });

  const eligileParticipantIds = eligibleParticipants.map(
    ({ participantId }) => participantId
  );

  result = tournamentEngine.addDrawEntries({
    participantIds: eligileParticipantIds,
    entryStage: VOLUNTARY_CONSOLATION,
    entryStatus: DIRECT_ACCEPTANCE,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.generateVoluntaryConsolation({
    automated: true,
    drawId,
  });
  expect(result.success).toEqual(true);

  const event = tournamentEngine.getEvent({ drawId }).event;
  const eventId = event.eventId;

  const policyDefinitions = {
    ...PARTICIPANT_PRIVACY_DEFAULT,
    ...ROUND_NAMING_POLICY,
  };

  let { eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    policyDefinitions,
    eventId,
  });
  expect(publishSuccess).toEqual(true);

  expect(eventData.drawsData[0].structures.map(({ stage }) => stage)).toEqual([
    'QUALIFYING',
    'MAIN',
    'VOLUNTARY_CONSOLATION',
  ]);

  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    stages: [QUALIFYING],
    policyDefinitions,
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData[0].structures.map(({ stage }) => stage)).toEqual([
    'QUALIFYING',
  ]);

  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    stagesToAdd: [MAIN],
    policyDefinitions,
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData[0].structures.map(({ stage }) => stage)).toEqual([
    'QUALIFYING',
    'MAIN',
  ]);

  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    stagesToAdd: [VOLUNTARY_CONSOLATION],
    stagesToRemove: [QUALIFYING],
    policyDefinitions,
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData[0].structures.map(({ stage }) => stage)).toEqual([
    'MAIN',
    'VOLUNTARY_CONSOLATION',
  ]);

  ({ eventData, success: publishSuccess } = tournamentEngine.publishEvent({
    policyDefinitions,
    stages: [MAIN],
    eventId,
  }));
  expect(publishSuccess).toEqual(true);
  expect(eventData.drawsData[0].structures.map(({ stage }) => stage)).toEqual([
    'MAIN',
  ]);
});
