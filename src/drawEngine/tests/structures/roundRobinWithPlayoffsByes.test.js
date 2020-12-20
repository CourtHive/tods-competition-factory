import drawEngine from '../../../drawEngine';
import tournamentEngine from '../../../tournamentEngine';

import { tournamentRecordWithParticipants } from '../../../tournamentEngine/tests/primitives';
import { reset, initialize } from '../primitives/primitives';

import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { setsValues } from './roundRobinSetsValues.js';

import {
  MAIN,
  PLAY_OFF,
  POSITION,
  WATERFALL,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can generate Playoffs for Round Robins when BYEs are present', () => {
  reset();
  initialize();
  const drawSize = 16;
  const groupSize = 4;
  const groupsCount = drawSize / groupSize;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  const playoffGroups = [
    {
      finishingPositions: [1, 2],
      structureName: 'Gold Flight',
      drawType: SINGLE_ELIMINATION,
    },
    {
      finishingPositions: [3, 4],
      structureName: 'Silver Flight',
      drawType: SINGLE_ELIMINATION,
    },
  ];
  const structureOptions = {
    groupSize,
    playoffGroups,
  };

  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    participantsCount: 15,
  });
  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Round Robin w/ Playoffs',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
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

  expect(drawDefinition.links.length).toEqual(playoffGroups.length);

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

  expect(playoffStructures.length).toEqual(playoffGroups.length);
  expect(playoffStructures[0].positionAssignments.length).toEqual(8);

  const playoffStructureIds = playoffStructures.map(
    (structure) => structure.structureId
  );

  const positioningLinks = drawDefinition.links.filter(
    (link) => link.linkType === POSITION
  );

  positioningLinks.forEach((link) => {
    expect(link.source.structureId).toEqual(mainStructure.structureId);
    const targetIsPlayoffStructure = playoffStructureIds.includes(
      link.target.structureId
    );
    expect(targetIsPlayoffStructure).toEqual(true);
  });

  const { drawId } = drawDefinition;
  const { matchUps: allStructureMatchUps } = drawEngine.allStructureMatchUps({
    structureId: mainStructure.structureId,
  });
  const allStructureMatchUpsCount = allStructureMatchUps.length;
  const matchUpsPerStructure =
    allStructureMatchUpsCount / (drawSize / groupSize);

  // now complete all matchUps in the Round Robin (MAIN) structure
  mainStructure.structures.forEach((structure, structureIndex) => {
    const values = setsValues[0];
    const structureMatchUps = structure.matchUps;
    structureMatchUps.forEach((matchUp, matchUpIndex) => {
      const { matchUpId } = matchUp;
      if (matchUp.matchUpStatus !== 'BYE') {
        const setValues = values[matchUpIndex];
        const outcome = generateMatchUpOutcome({
          matchUpFormat,
          setValues,
        });
        const result = tournamentEngine.setMatchUpStatus({
          drawId,
          matchUpId,
          outcome,
        });
        expect(result).toEqual(SUCCESS);
      }

      const matchUpInstance =
        structureIndex * matchUpsPerStructure + (matchUpIndex + 1);
      const mainStructureIsCompleted = drawEngine.isCompletedStructure({
        structureId: mainStructure.structureId,
      });
      const expectCompletedStructure =
        matchUpInstance === allStructureMatchUpsCount;
      expect(mainStructureIsCompleted).toEqual(expectCompletedStructure);
    });
  });

  const { matchUps: eventMatchUps } = tournamentEngine.allEventMatchUps({
    eventId,
  });

  const finishingPositionGroups = {};
  const structureParticipantGroupings = [];

  mainStructure.structures.forEach((structure) => {
    const { structureId } = structure;

    const structureMatchUps = eventMatchUps.filter(
      (matchUp) => matchUp.structureId === structureId
    );

    const { participantResults } = drawEngine.tallyParticipantResults({
      matchUps: structureMatchUps,
      matchUpFormat,
    });

    const structureParticipantIds = Object.keys(participantResults);
    structureParticipantGroupings.push(structureParticipantIds);

    structureParticipantIds.forEach((key) => {
      const { groupOrder } = participantResults[key];
      if (!finishingPositionGroups[groupOrder])
        finishingPositionGroups[groupOrder] = [];
      finishingPositionGroups[groupOrder].push(key);
      expect([1, 2, 3, 4].includes(groupOrder)).toEqual(true);
    });
  });

  const finishingGroupSizes = [4, 4, 4, 3];
  Object.keys(finishingPositionGroups).forEach((key, index) => {
    expect(finishingPositionGroups[key].length).toEqual(
      finishingGroupSizes[index]
    );
  });

  result = tournamentEngine.automatedPlayoffPositioning({
    drawId,
    structureId: mainStructure.structureId,
  });
  expect(result).toEqual(SUCCESS);

  const {
    drawDefinition: updatedDrawDefinition,
  } = tournamentEngine.getDrawDefinition({ drawId });

  const updatedPlayoffStructures = updatedDrawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAY_OFF
        ? structures.concat(structure)
        : structures;
    },
    []
  );

  const goldPlayoffParticipantIds = updatedPlayoffStructures[0].positionAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);
  const silverPlayoffParticipantIds = updatedPlayoffStructures[1].positionAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);
  expect(goldPlayoffParticipantIds.length).toEqual(8);
  expect(silverPlayoffParticipantIds.length).toEqual(7);

  const allPlayoffPositionsFilled = drawEngine.allPlayoffPositionsFilled({
    structureId: mainStructure.structureId,
  });
  expect(allPlayoffPositionsFilled).toEqual(true);
});
