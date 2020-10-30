import drawEngine from '../../../drawEngine';
import tournamentEngine from '../../../tournamentEngine';

import { tournamentRecordWithParticipants } from '../../../tournamentEngine/tests/primitives';
import { reset, initialize } from '../primitives/primitives';

import { findStructure } from '../../getters/findStructure';
import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { setsValues } from './roundRobinSetsValues.js';

import {
  MAIN,
  PLAYOFF,
  POSITION,
  WATERFALL,
  ROUND_ROBIN_WITH_PLAYOFF,
  ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { intersection } from '../../../utilities/arrays';

it('can advance players in Round Robin with Playoffs', () => {
  reset();
  initialize();
  const drawSize = 20;
  const groupSize = 4;
  const groupsCount = drawSize / groupSize;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  const playoffGroups = [
    {
      finishingPositions: [1, 2],
      structureName: 'Gold Flight',
      drawType: ELIMINATION,
    },
    {
      finishingPositions: [3, 4],
      structureName: 'Silver Flight',
      drawType: ELIMINATION,
    },
  ];
  const structureOptions = {
    groupSize,
    playoffGroups,
  };

  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    participantsCount: drawSize,
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

  expect(drawDefinition.links.length).toEqual(playoffGroups.length);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const mainStructure = drawDefinition.structures.find(
    structure => structure.stage === MAIN
  );

  expect(mainStructure.structures.length).toEqual(groupsCount);
  expect(mainStructure.structures[0].positionAssignments.length).toEqual(4);

  const playoffStructures = drawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAYOFF
        ? structures.concat(structure)
        : structures;
    },
    []
  );

  expect(playoffStructures.length).toEqual(playoffGroups.length);
  expect(playoffStructures[0].positionAssignments.length).toEqual(16);

  const playoffStructureIds = playoffStructures.map(
    structure => structure.structureId
  );

  const positioningLinks = drawDefinition.links.filter(
    link => link.linkType === POSITION
  );

  positioningLinks.forEach(link => {
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
  mainStructure.structures.forEach((structure, structureIndex) => {
    const values = setsValues[structureIndex];
    const structureMatchUps = structure.matchUps;
    structureMatchUps.forEach((matchUp, matchUpIndex) => {
      const { matchUpId } = matchUp;
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

      const thisStructureIsCompleted = drawEngine.isCompletedStructure({
        structureId: structure.structureId,
      });
      expect(thisStructureIsCompleted).toEqual(
        matchUpIndex + 1 === matchUpsPerStructure
      );

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
  mainStructure.structures.forEach(structure => {
    const { structureId } = structure;
    const structureMatchUps = eventMatchUps.filter(
      matchUp => matchUp.structureId === structureId
    );
    const { participantResults } = drawEngine.tallyParticipantResults({
      matchUps: structureMatchUps,
      matchUpFormat,
    });
    Object.keys(participantResults).forEach(key => {
      const { groupOrder } = participantResults[key];
      if (!finishingPositionGroups[groupOrder])
        finishingPositionGroups[groupOrder] = [];
      finishingPositionGroups[groupOrder].push(key);
      expect([1, 2, 3, 4].includes(groupOrder)).toEqual(true);
    });
  });
  Object.keys(finishingPositionGroups).forEach(key => {
    expect(finishingPositionGroups[key].length).toEqual(groupsCount);
  });

  playoffStructures.forEach(structure => {
    const { structureId } = structure;
    // position participants
    drawEngine.automatedPositioning({ structureId });

    // verify that positioning participants are expected
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    const { structure: updatedStructure } = findStructure({
      drawDefinition: updatedDrawDefinition,
      structureId,
    });
    const positioningLink = positioningLinks.find(
      link => link.target.structureId === structure.structureId
    );
    const structureFinishingPositions =
      positioningLink.source.finishingPositions;
    const finishingPositionGroup = structureFinishingPositions
      .map(finishingPosition => finishingPositionGroups[finishingPosition])
      .flat();
    const structureParticipantIds = updatedStructure.positionAssignments
      .map(assignment => assignment.participantId)
      .filter(f => f);
    const expectedParticipantIds = intersection(
      structureParticipantIds,
      finishingPositionGroup
    );
    expect(expectedParticipantIds.length).toEqual(
      groupsCount * structureFinishingPositions.length
    );
  });

  const allPlayoffPositionsFilled = drawEngine.allPlayoffPositionsFilled({
    structureId: mainStructure.structureId,
  });
  expect(allPlayoffPositionsFilled).toEqual(true);
});
