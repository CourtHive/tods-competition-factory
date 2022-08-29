import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect } from 'vitest';

import { ENTRY_PROFILE } from '../../../constants/extensionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { RATING, SEEDING } from '../../../constants/scaleConstants';
import { ELO } from '../../../constants/ratingConstants';
import {
  DRAW,
  MAIN,
  QUALIFYING,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
  WINNER,
} from '../../../constants/drawDefinitionConstants';
import {
  DRAW_ID_EXISTS,
  INVALID_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';

it.each([ROUND_ROBIN, SINGLE_ELIMINATION, undefined])(
  'will generate a drawDefinition with no matchUps',
  (drawType) => {
    let result = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize: 0, drawType }],
    });

    expect(result.error).toEqual(INVALID_DRAW_SIZE);
  }
);

it('can generate QUALIFYING structures when no MAIN structure is specified', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        ignoreDefaults: true,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              { stageSequence: 1, drawSize: 16, qualifyingRoundNumber: 2 },
            ],
          },
        ],
      },
    ],
  });

  let {
    tournamentRecord,
    drawIds: [drawId],
  } = result;

  tournamentEngine.setState(tournamentRecord);
  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(16);
  expect(event.entries.length).toEqual(16);
  let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  expect(matchUps.length).toEqual(12);

  const entryStages = unique(event.entries.map(({ entryStage }) => entryStage));
  expect(entryStages).toEqual([QUALIFYING]);

  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  expect(mainStructure.matchUps.length).toEqual(0);

  const qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  expect(qualifyingStructure.matchUps.length).toEqual(12);

  const links = drawDefinition.links;
  expect(links.length).toEqual(1);
  expect(links[0].linkType).toEqual(WINNER);

  expect(links[0].source.structureId).toEqual(qualifyingStructure.structureId);

  expect(links[0].target.feedProfile).toEqual(DRAW);
  expect(links[0].target.structureId).toEqual(mainStructure.structureId);
  expect(links[0].target.roundNumber).toEqual(1);

  const structureIds = drawDefinition.structures.map(
    ({ structureId }) => structureId
  );
  result = tournamentEngine.generateDrawTypeAndModifyDrawDefinition({
    modifyOriginal: false,
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);

  // check that structureIds have not changed
  expect(
    result.drawDefinition.structures.map(({ structureId }) => structureId)
  ).toEqual(structureIds);

  // check that number of matchUps has not changed in state
  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  matchUps = tournamentEngine.allDrawMatchUps({ drawDefinition }).matchUps;
  expect(matchUps.length).toEqual(12);

  // check that result.drawDefinition has more matchUps
  matchUps = tournamentEngine.allDrawMatchUps({
    drawDefinition: result.drawDefinition,
  }).matchUps;
  expect(matchUps.length).toBeGreaterThan(12);

  expect(drawDefinition.structures[1].matchUps.length).toEqual(0);
  expect(result.drawDefinition.structures[1].matchUps.length).toEqual(31);

  const existingEntryProfile = tournamentEngine.findDrawDefinitionExtension({
    name: ENTRY_PROFILE,
    drawId,
  }).extension.value;

  result = tournamentEngine.generateDrawDefinition({
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);
  const newEntryProfile = tournamentEngine.findExtension({
    element: result.drawDefinition,
    name: ENTRY_PROFILE,
  }).extension.value;

  expect(existingEntryProfile[QUALIFYING]).toEqual(newEntryProfile[QUALIFYING]);
  expect(existingEntryProfile[MAIN]).not.toEqual(newEntryProfile[MAIN]);
  expect(existingEntryProfile[MAIN].drawSize).toBeUndefined();
  expect(newEntryProfile[MAIN].drawSize).toEqual(32);

  result = tournamentEngine.addDrawDefinition({
    drawDefinition: result.drawDefinition,
    eventId: event.eventId,
  });
  expect(result.error).toEqual(DRAW_ID_EXISTS);

  result = tournamentEngine.generateDrawDefinition({
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addDrawDefinition({
    drawDefinition: result.drawDefinition,
    allowReplacement: true,
    eventId: event.eventId,
  });
  expect(result.success).toEqual(true);
});

it('can generate and seed a qualifying structure', () => {
  const ratingType = ELO;
  const participantsCount = 44;
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [{ eventName: 'QTest' }],
    participantsProfile: {
      scaledParticipantsCount: 44,
      category: { ratingType },
      participantsCount: 44,
    },
  });

  tournamentEngine.setState(tournamentRecord);

  let event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(0);

  const participants =
    tournamentEngine.getTournamentParticipants().tournamentParticipants;
  expect(participants.length).toEqual(44);

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
  const seededDrawPositions = console.log(
    drawDefinition.structures[0].seedAssignments.map((assignment) => [
      assignment.seedNumber,
      participantIdDrawPositionMap[assignment.participantId],
    ])
  );
  console.log(seededDrawPositions);
});
