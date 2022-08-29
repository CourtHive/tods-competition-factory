import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { expect } from 'vitest';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { INDIVIDUAL } from '../../../constants/participantConstants';
import { SEEDING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can generateDrawDefinition and place qualifiers', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 100 },
    eventProfiles: [{ eventName: 'test' }],
  });
  expect(tournamentRecord.participants.length).toEqual(100);

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  const mainParticipantIds = participantIds.slice(0, 12);
  const qualifyingParticipantIds = participantIds.slice(12, 28);

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

  const qualifyingSeedingScaleName = 'QS';
  const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8];
  scaleValues.forEach((scaleValue, index) => {
    let scaleItem = {
      scaleName: qualifyingSeedingScaleName,
      scaleType: SEEDING,
      eventType: SINGLES,
      scaleValue,
    };
    const participantId = qualifyingParticipantIds[index];
    let result = tournamentEngine.setParticipantScaleItem({
      participantId,
      scaleItem,
    });
    expect(result.success).toEqual(true);
  });

  console.log('--------');
  let { drawDefinition } = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          {
            seedingScaleName: qualifyingSeedingScaleName,
            qualifyingPositions: 4,
            seedsCount: 4,
            drawSize: 16,
          },
        ],
      },
    ],
    qualifyingOnly: true,
    eventId,
  });
  let qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  expect(qualifyingStructure.matchUps.length).toEqual(12);

  const participantIdDrawPositionMap = Object.assign(
    {},
    ...qualifyingStructure.positionAssignments.map(
      ({ participantId, drawPosition }) => ({ [participantId]: drawPosition })
    )
  );
  const seededDrawPositions = console.log(
    qualifyingStructure.seedAssignments.map((assignment) => [
      assignment.seedNumber,
      participantIdDrawPositionMap[assignment.participantId],
    ])
  );
  console.log(seededDrawPositions);

  let mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  expect(mainStructure.matchUps.length).toEqual(0);

  console.log('--------');
  drawDefinition = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          { seedsCount: 4, drawSize: 16, qualifyingPositions: 4 },
        ],
      },
    ],
    eventId,
  }).drawDefinition;

  mainStructure = drawDefinition.structures.find(({ stage }) => stage === MAIN);
  expect(mainStructure.matchUps.length).toEqual(15);
});
