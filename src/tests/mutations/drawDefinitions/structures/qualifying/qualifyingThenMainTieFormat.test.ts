import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, it } from 'vitest';

import { MAIN, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { INDIVIDUAL, TEAM } from '@Constants/participantConstants'
import { SINGLES } from '@Constants/eventConstants';
import { DOUBLES } from '@Constants/matchUpTypes';
import { ANY, MALE } from '@Constants/genderConstants';

it('can generate a qualifying structure with tieFormat, then generate a main structure with a different tieFormat', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: TEAM, participantsCount: 40 },
    eventProfiles: [{ eventName: 'test', eventType: TEAM }],
  });

  const individualParticipants = tournamentRecord.participants.filter((p) => p.participantType === INDIVIDUAL);
  const teamParticipants = tournamentRecord.participants.filter((p) => p.participantType === TEAM);

  expect(individualParticipants.length).toEqual(320);
  expect(teamParticipants.length).toEqual(40);

  tournamentEngine.setState(tournamentRecord);

  const participantIds = teamParticipants.map((p) => p.participantId);
  const mainParticipantIds = participantIds.slice(0, 14);
  const qualifyingParticipantIds = participantIds.slice(14, 28);

  let result = tournamentEngine.addEventEntries({
    participantIds: mainParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addEventEntries({
    participantIds: qualifyingParticipantIds,
    entryStage: QUALIFYING,
    eventId,
  });
  expect(result.success).toEqual(true);

  const qualifyingTieFormat = {
    tieFormatName: 'CUSTOM',
    collectionDefinitions: [
      {
        category: {
          ageCategoryCode: 'U18',
        },
        gender: ANY,
        collectionOrder: 1,
        matchUpValue: 1,
        collectionName: 'Qualifying Collection',
        matchUpCount: 3,
        matchUpType: DOUBLES,
        matchUpFormat: 'SET3-S:6/TB7',
        collectionId: 'Q-collection1',
      },
    ],
    winCriteria: {
      valueGoal: 2,
      success: true,
    },
  };

  const mainTieFormat = {
    tieFormatName: 'CUSTOM',
    collectionDefinitions: [
      {
        category: {
          ageCategoryCode: 'U18',
        },
        gender: MALE,
        collectionOrder: 1,
        matchUpValue: 1,
        collectionName: 'Main Collection',
        matchUpCount: 2,
        matchUpType: SINGLES,
        matchUpFormat: 'SET3-S:6/TB7',
        collectionId: 'M-collection1',
      },
    ],
    winCriteria: {
      valueGoal: 2,
      success: true,
    },
  };

  let { drawDefinition: qualifyingDrawDefinition } = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          {
            drawSize: 16,
            matchUpFormat: 'SET1-S:TB11NOAD',
            qualifyingPositions: 2,
            seedsCount: 0,
          },
        ],
      },
    ],
    qualifyingOnly: true,
    tieFormat: qualifyingTieFormat,
    eventId,
  });

  // verify qualifying structure has been created with tieFormat at structure level
  const qualifyingStructure = qualifyingDrawDefinition.structures.find(({ stage }) => stage === QUALIFYING);
  expect(qualifyingStructure.matchUps.length).toEqual(14);
  expect(qualifyingStructure.matchUps[0].tieMatchUps.length).toEqual(3);
  expect(qualifyingStructure.tieFormat.collectionDefinitions.length).toEqual(1);
  expect(qualifyingStructure.tieFormat.collectionDefinitions[0].collectionName).toEqual('Qualifying Collection');
  expect(qualifyingStructure.tieFormat.collectionDefinitions[0].collectionId).toEqual(
    qualifyingTieFormat.collectionDefinitions[0].collectionId,
  );

  tournamentEngine.addDrawDefinition({
    activeTournamentId: tournamentRecord.tournamentId,
    drawDefinition: qualifyingDrawDefinition,
    allowReplacement: true,
    existingDrawCount: 0,
    eventId,

  });

  const mainDrawEntries = [
    ...mainParticipantIds.map((p, i) => ({
      participantId: p,
      entryStatus: 'DIRECT_ACCEPTANCE',
      entryStage: 'MAIN',
      entryPosition: i + 1,
    })),
    ...qualifyingParticipantIds.slice(0, 2).map((p, i) => ({
      participantId: p,
      entryStatus: 'DIRECT_ACCEPTANCE',
      entryStage: 'QUALIFYING',
      entryPosition: i + 1,
    })),
  ];

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    drawSize: 16,
    drawType: 'SINGLE_ELIMINATION',
    structureOptions: {
      groupSize: 4,
    },
    seedingProfile: {},
    voluntaryConsolation: false,
    advancedPerGroup: '1',
    advancementType: 'TOP_FINISHERS',
    automated: 'automated',
    drawName: 'Draw',
    drawStage: 'MAIN',
    matchUpFormat: 'SET1-S:TB11NOAD',
    placeRemainingPlayers: false,
    playoffStructure: 'COMPASS',
    qualifiersCount: 2,
    qualifyingDrawSize: 4,
    qualifyingSeedsCount: 0,
    scoring: 's3',
    seedsCount: 0,
    tieFormatName: '',
    eventId: eventId,
    ignoreStageSpace: true,
    tieFormat: mainTieFormat,
    drawId: qualifyingDrawDefinition.drawId,
    drawEntries: mainDrawEntries,
    enforceMinimumDrawSize: false,
    hydrateCollections: true,
    seedByRanking: false,
    ignoreAllowedDrawTypes: true,
    feedPolicy: {
      roundGroupedOrder: [[1], [1], [1, 2], [3, 4, 1, 2], [2, 1, 4, 3, 6, 5, 8, 7], [1]],
      roundFeedProfiles: [
        'TOP_DOWN',
        'BOTTOM_UP',
        'BOTTOM_UP',
        'BOTTOM_UP',
        'BOTTOM_UP',
        'BOTTOM_UP',
        'BOTTOM_UP',
        'BOTTOM_UP',
      ],
    },
    finishingPositionNaming: {
      '3-4': {
        name: '3-4 Playoff',
        abbreviation: 'PL',
      },
    },
    qualifyingPlaceholder: true,
    activeTournamentId: tournamentRecord.tournamentId,
  });

  //verify main structure has been created with tieFormat at drawDefinition level
  let mainStructure = drawDefinition.structures.find(({ stage }) => stage === MAIN);
  expect(mainStructure.matchUps.length).toEqual(15);
  expect(mainStructure.matchUps[0].tieMatchUps.length).toEqual(2);
  expect(mainStructure.tieFormat).toBeUndefined();
  expect(drawDefinition.tieFormat.collectionDefinitions.length).toEqual(1);
  expect(drawDefinition.tieFormat.collectionDefinitions[0].collectionName).toEqual('Main Collection');
  expect(drawDefinition.tieFormat.collectionDefinitions[0].collectionId).toEqual(
    mainTieFormat.collectionDefinitions[0].collectionId,
  );

  // reverify qualifying structure with tieFormat at structure level
  const newQualifyingStructure = drawDefinition.structures.find(({ stage }) => stage === QUALIFYING);
  expect(newQualifyingStructure.matchUps.length).toEqual(14);
  expect(newQualifyingStructure.matchUps[0].tieMatchUps.length).toEqual(3);
  expect(newQualifyingStructure.tieFormat.collectionDefinitions.length).toEqual(1);
  expect(newQualifyingStructure.tieFormat.collectionDefinitions[0].collectionName).toEqual('Qualifying Collection');
  expect(newQualifyingStructure.tieFormat.collectionDefinitions[0].collectionId).toEqual(
    qualifyingTieFormat.collectionDefinitions[0].collectionId,
  );
});
