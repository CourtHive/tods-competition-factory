import drawEngine from '../../sync';
import tournamentEngine from '../../../tournamentEngine/sync';
import { chunkArray, intersection } from '../../../utilities/arrays';

import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';
import { reset, initialize } from '../primitives/primitives';

import { findStructure } from '../../getters/findStructure';
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
import {
  allPlayoffPositionsFilled,
  isCompletedStructure,
} from '../../governors/queryGovernor/structureActions';

it('can advance players in Round Robin with Playoffs => 2 x 4 x 4', () => {
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

  const { tournamentRecord } = generateTournamentWithParticipants({
    participantsCount: drawSize,
  });
  const { participants } = tournamentRecord;
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
  let { drawDefinition } = tournamentEngine.generateDrawDefinition({
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
  mainStructure.structures.forEach((structure, structureOrder) => {
    const values = setsValues[0];
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
      expect(result.success).toEqual(true);

      ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
      const thisStructureIsCompleted = isCompletedStructure({
        drawDefinition,
        structureId: structure.structureId,
      });
      expect(thisStructureIsCompleted).toEqual(
        matchUpIndex + 1 === matchUpsPerStructure
      );

      const matchUpInstance =
        structureOrder * matchUpsPerStructure + (matchUpIndex + 1);
      const mainStructureIsCompleted = isCompletedStructure({
        drawDefinition,
        structureId: mainStructure.structureId,
      });
      const expectCompletedStructure =
        matchUpInstance === allStructureMatchUpsCount;
      expect(mainStructureIsCompleted).toEqual(expectCompletedStructure);
    });
  });

  const { matchUps: eventMatchUps } = tournamentEngine.allEventMatchUps({
    eventId,
    inContext: true,
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

  Object.keys(finishingPositionGroups).forEach((key) => {
    expect(finishingPositionGroups[key].length).toEqual(groupsCount);
  });

  playoffStructures.forEach((structure) => {
    const { structureId } = structure;
    // position participants
    tournamentEngine.automatedPositioning({
      drawId,
      structureId,
    });

    // verify that positioning participants are expected
    const {
      drawDefinition: updatedDrawDefinition,
    } = tournamentEngine.getEvent({ drawId });
    // const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    const { structure: updatedStructure } = findStructure({
      drawDefinition: updatedDrawDefinition,
      structureId,
    });
    const positioningLink = positioningLinks.find(
      (link) => link.target.structureId === structure.structureId
    );
    const structureFinishingPositions =
      positioningLink.source.finishingPositions;
    const finishingPositionGroup = structureFinishingPositions
      .map((finishingPosition) => finishingPositionGroups[finishingPosition])
      .flat();
    const structureParticipantIds = updatedStructure.positionAssignments
      .map((assignment) => assignment.participantId)
      .filter((f) => f);
    const expectedParticipantIds = intersection(
      structureParticipantIds,
      finishingPositionGroup
    );
    expect(expectedParticipantIds.length).toEqual(
      groupsCount * structureFinishingPositions.length
    );

    const { positionAssignments } = updatedStructure;
    const pairedPositions = chunkArray(positionAssignments, 2);
    const pairedParticipantIds = pairedPositions
      .map((positions) => positions.map((position) => position.participantId))
      .filter((pair) => pair.filter((p) => p).length === 2);

    pairedParticipantIds.forEach((pair) => {
      structureParticipantGroupings.forEach((grouping) => {
        const overlap = intersection(grouping, pair);
        expect(overlap.length).toBeLessThan(2);
      });
    });
  });

  const { drawDefinition: updatedDrawDefinition } = tournamentEngine.getEvent({
    drawId,
  });
  const allPositionsFilled = allPlayoffPositionsFilled({
    drawDefinition: updatedDrawDefinition,
    structureId: mainStructure.structureId,
  });
  expect(allPositionsFilled).toEqual(true);
});

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

  const { tournamentRecord } = generateTournamentWithParticipants({
    participantsCount: drawSize,
  });
  const { participants } = tournamentRecord;
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
  let { drawDefinition } = tournamentEngine.generateDrawDefinition({
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
  expect(playoffStructures[0].positionAssignments.length).toEqual(16);

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
  mainStructure.structures.forEach((structure, structureOrder) => {
    const values = setsValues[0];
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
      expect(result.success).toEqual(true);

      ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
      const thisStructureIsCompleted = isCompletedStructure({
        drawDefinition,
        structureId: structure.structureId,
      });
      expect(thisStructureIsCompleted).toEqual(
        matchUpIndex + 1 === matchUpsPerStructure
      );

      const matchUpInstance =
        structureOrder * matchUpsPerStructure + (matchUpIndex + 1);
      const mainStructureIsCompleted = isCompletedStructure({
        drawDefinition,
        structureId: mainStructure.structureId,
      });
      const expectCompletedStructure =
        matchUpInstance === allStructureMatchUpsCount;
      expect(mainStructureIsCompleted).toEqual(expectCompletedStructure);
    });
  });

  const { matchUps: eventMatchUps } = tournamentEngine.allEventMatchUps({
    eventId,
    inContext: true,
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

  Object.keys(finishingPositionGroups).forEach((key) => {
    expect(finishingPositionGroups[key].length).toEqual(groupsCount);
  });

  playoffStructures.forEach((structure) => {
    const { structureId } = structure;
    // position participants
    tournamentEngine.automatedPositioning({
      drawId,
      structureId,
    });

    // verify that positioning participants are expected
    const {
      drawDefinition: updatedDrawDefinition,
    } = tournamentEngine.getEvent({ drawId });
    const { structure: updatedStructure } = findStructure({
      drawDefinition: updatedDrawDefinition,
      structureId,
    });
    const positioningLink = positioningLinks.find(
      (link) => link.target.structureId === structure.structureId
    );
    const structureFinishingPositions =
      positioningLink.source.finishingPositions;
    const finishingPositionGroup = structureFinishingPositions
      .map((finishingPosition) => finishingPositionGroups[finishingPosition])
      .flat();
    const structureParticipantIds = updatedStructure.positionAssignments
      .map((assignment) => assignment.participantId)
      .filter((f) => f);
    const expectedParticipantIds = intersection(
      structureParticipantIds,
      finishingPositionGroup
    );
    expect(expectedParticipantIds.length).toEqual(
      groupsCount * structureFinishingPositions.length
    );

    const { positionAssignments } = updatedStructure;
    const pairedPositions = chunkArray(positionAssignments, 2);
    const pairedParticipantIds = pairedPositions
      .map((positions) => positions.map((position) => position.participantId))
      .filter((pair) => pair.filter((p) => p).length === 2);

    pairedParticipantIds.forEach((pair) => {
      structureParticipantGroupings.forEach((grouping) => {
        const overlap = intersection(grouping, pair);
        expect(overlap.length).toBeLessThan(2);
      });
    });
  });

  const { drawDefinition: updatedDrawDefinition } = tournamentEngine.getEvent({
    drawId,
  });
  const allPositionsFilled = allPlayoffPositionsFilled({
    drawDefinition: updatedDrawDefinition,
    structureId: mainStructure.structureId,
  });
  expect(allPositionsFilled).toEqual(true);
});
