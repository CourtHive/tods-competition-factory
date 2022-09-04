import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect } from 'vitest';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { RATING, SEEDING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { ELO } from '../../../constants/ratingConstants';

it('can generate and seed a qualifying structure', () => {
  const ratingType = ELO;
  const participantsCount = 44;
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [{ eventName: 'QTest' }],
    participantsProfile: {
      scaledParticipantsCount: participantsCount,
      category: { ratingType },
      participantsCount,
    },
  });

  tournamentEngine.setState(tournamentRecord);

  let event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(0);

  const participants =
    tournamentEngine.getTournamentParticipants().tournamentParticipants;
  expect(participants.length).toEqual(participantsCount);

  const scaledParticipants = participants.filter(({ timeItems }) => timeItems);
  expect(scaledParticipants.length).toEqual(participantsCount);

  const scaleAttributes = {
    scaleType: RATING,
    eventType: SINGLES,
    scaleName: ELO,
  };
  let result = tournamentEngine.participantScaleItem({
    participant: scaledParticipants[0],
    scaleAttributes,
  });
  expect(result.scaleItem.scaleName).toEqual(ratingType);

  const participantIds = participants.map(getParticipantId);
  const mainStageEntryIds = participantIds.slice(0, 12);
  const qualifyingStageEntryIds = participantIds.slice(12);

  const sortedQualifyingParticipantIds = qualifyingStageEntryIds.sort(
    (a, b) =>
      tournamentEngine.getParticipantScaleItem({
        scaleAttributes,
        participantId: a,
      }).scaleItem.scaleValue -
      tournamentEngine.getParticipantScaleItem({
        scaleAttributes,
        participantId: b,
      }).scaleItem.scaleValue
  );

  result = tournamentEngine.addEventEntries({
    participantIds: mainStageEntryIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addEventEntries({
    participantIds: qualifyingStageEntryIds,
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
    const participantId = sortedQualifyingParticipantIds[index];
    let result = tournamentEngine.setParticipantScaleItem({
      participantId,
      scaleItem,
    });
    expect(result.success).toEqual(true);
  });

  result = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          {
            seedingScaleName: qualifyingSeedingScaleName,
            qualifyingPositions: 4,
            seedsCount: 4,
            drawSize: 32,
          },
        ],
      },
    ],
    qualifyingOnly: true,
    eventId,
  });
  expect(result.success).toEqual(true);
  const drawDefinition = result.drawDefinition;
  expect(drawDefinition.structures.length).toEqual(2);
  expect(
    drawDefinition.structures[0].positionAssignments.filter(
      ({ participantId }) => participantId
    ).length
  ).toEqual(32);

  expect(drawDefinition.structures[1].matchUps.length).toEqual(0);
  expect(
    drawDefinition.structures[0].seedAssignments.map(
      ({ participantId }) => participantId
    ).length
  ).toEqual(4);

  const participantIdDrawPositionMap = Object.assign(
    {},
    ...drawDefinition.structures[0].positionAssignments.map(
      ({ participantId, drawPosition }) => ({ [participantId]: drawPosition })
    )
  );
  const seededDrawPositions = drawDefinition.structures[0].seedAssignments.map(
    (assignment) => [
      assignment.seedNumber,
      participantIdDrawPositionMap[assignment.participantId],
    ]
  );
  expect(seededDrawPositions).toEqual([
    [1, 1],
    [2, 5],
    [3, 9],
    [4, 13],
  ]);
});
