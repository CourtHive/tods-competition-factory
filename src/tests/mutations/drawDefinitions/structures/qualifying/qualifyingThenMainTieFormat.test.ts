import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, it } from 'vitest';

// Constants
import { MAIN, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { INDIVIDUAL, TEAM } from '@Constants/participantConstants';
import { ANY, MALE } from '@Constants/genderConstants';
import { SINGLES } from '@Constants/eventConstants';
import { DOUBLES } from '@Constants/matchUpTypes';

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

  const qualifyingCollectionName = 'Qualifying Collection';
  const qualifyingTieFormat = {
    tieFormatName: 'CUSTOM',
    collectionDefinitions: [
      {
        collectionName: qualifyingCollectionName,
        category: { ageCategoryCode: 'U18' },
        matchUpFormat: 'SET3-S:6/TB7',
        collectionId: 'Q-collection1',
        matchUpType: DOUBLES,
        collectionOrder: 1,
        matchUpValue: 1,
        matchUpCount: 3,
        gender: ANY,
      },
    ],
    winCriteria: { valueGoal: 2, success: true },
  };

  const mainCollectionName = 'Main Collection';
  const mainTieFormat = {
    tieFormatName: 'CUSTOM',
    collectionDefinitions: [
      {
        category: { ageCategoryCode: 'U18' },
        collectionName: mainCollectionName,
        matchUpFormat: 'SET3-S:6/TB7',
        collectionId: 'M-collection1',
        matchUpType: SINGLES,
        collectionOrder: 1,
        matchUpValue: 1,
        matchUpCount: 2,
        gender: MALE,
      },
    ],
    winCriteria: { valueGoal: 2, success: true },
  };

  let { drawDefinition: qualifyingDrawDefinition } = tournamentEngine.generateDrawDefinition({
    tieFormat: qualifyingTieFormat,
    qualifyingOnly: true,
    qualifyingProfiles: [
      {
        structureProfiles: [
          {
            matchUpFormat: 'SET1-S:TB11NOAD',
            qualifyingPositions: 2,
            seedsCount: 0,
            drawSize: 16,
          },
        ],
      },
    ],
    eventId,
  });

  // verify qualifying structure has been created with tieFormat at structure level
  const qualifyingStructure = qualifyingDrawDefinition.structures.find(({ stage }) => stage === QUALIFYING);
  expect(qualifyingStructure.matchUps.length).toEqual(14);
  expect(qualifyingStructure.matchUps[0].tieMatchUps.length).toEqual(3);
  expect(qualifyingStructure.tieFormat.collectionDefinitions.length).toEqual(1);
  expect(qualifyingStructure.tieFormat.collectionDefinitions[0].collectionName).toEqual(qualifyingCollectionName);
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
      entryStatus: 'DIRECT_ACCEPTANCE',
      entryPosition: i + 1,
      entryStage: 'MAIN',
      participantId: p,
    })),
    ...qualifyingParticipantIds.slice(0, 2).map((p, i) => ({
      entryStatus: 'DIRECT_ACCEPTANCE',
      entryStage: 'QUALIFYING',
      entryPosition: i + 1,
      participantId: p,
    })),
  ];

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    activeTournamentId: tournamentRecord.tournamentId,
    drawId: qualifyingDrawDefinition.drawId,
    structureOptions: { groupSize: 4 },
    drawEntries: mainDrawEntries,
    tieFormat: mainTieFormat,
    qualifyingDrawSize: 4,
    qualifiersCount: 2,
    eventId: eventId,
    automated: true,
    drawSize: 16,
  });

  //verify main structure has been created with tieFormat at drawDefinition level
  let mainStructure = drawDefinition.structures.find(({ stage }) => stage === MAIN);
  expect(mainStructure.matchUps.length).toEqual(15);
  expect(mainStructure.matchUps[0].tieMatchUps.length).toEqual(2);
  expect(mainStructure.tieFormat).toBeUndefined();
  expect(drawDefinition.tieFormat.collectionDefinitions.length).toEqual(1);
  expect(drawDefinition.tieFormat.collectionDefinitions[0].collectionName).toEqual(mainCollectionName);
  expect(drawDefinition.tieFormat.collectionDefinitions[0].collectionId).toEqual(
    mainTieFormat.collectionDefinitions[0].collectionId,
  );

  // reverify qualifying structure with tieFormat at structure level
  const newQualifyingStructure = drawDefinition.structures.find(({ stage }) => stage === QUALIFYING);
  expect(newQualifyingStructure.matchUps.length).toEqual(14);
  expect(newQualifyingStructure.matchUps[0].tieMatchUps.length).toEqual(3);
  expect(newQualifyingStructure.tieFormat.collectionDefinitions.length).toEqual(1);
  expect(newQualifyingStructure.tieFormat.collectionDefinitions[0].collectionName).toEqual(qualifyingCollectionName);
  expect(newQualifyingStructure.tieFormat.collectionDefinitions[0].collectionId).toEqual(
    qualifyingTieFormat.collectionDefinitions[0].collectionId,
  );
});
