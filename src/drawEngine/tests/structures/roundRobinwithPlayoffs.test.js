import drawEngine from '../../../drawEngine';
import tournamentEngine from '../../../tournamentEngine';

import { generateTournament } from '../../../tournamentEngine/tests/primitives';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';

import { findStructure } from '../../getters/findStructure';
import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { setsValues } from './roundRobinSetsValues.js';

import {
  DRAW,
  FMLC,
  MAIN,
  PLAY_OFF,
  POSITION,
  WATERFALL,
  ROUND_OUTCOME,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
  CONSOLATION,
  LOSER,
} from '../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { chunkArray, intersection } from '../../../utilities/arrays';

it('can generate Round Robins 32 with playoffs', () => {
  reset();
  initialize();
  const drawSize = 32;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  mainDrawPositions({ drawSize });
  const structureOptions = {
    playoffGroups: [
      { finishingPositions: [1], structureName: 'Gold Flight' },
      { finishingPositions: [2], structureName: 'Silver Flight' },
    ],
  };
  const result = drawEngine.generateDrawType({
    drawType,
    structureOptions,
  });
  const { mainStructure, playoffStructures, links } = result;

  expect(mainStructure.stage).toEqual(MAIN);
  expect(mainStructure.structures.length).toEqual(8);

  expect(playoffStructures.length).toEqual(2);
  expect(playoffStructures[0].structureName).toEqual('Gold Flight');
  expect(playoffStructures[1].structureName).toEqual('Silver Flight');

  expect(playoffStructures[0].stage).toEqual(PLAY_OFF);
  expect(playoffStructures[0].finishingPosition).toEqual(ROUND_OUTCOME);
  expect(playoffStructures[0].matchUps.length).toEqual(7);
  expect(playoffStructures[0].matchUps[0].finishingRound).toEqual(3);

  expect(links.length).toEqual(2);
  expect(links[0].linkType).toEqual(POSITION);
  expect(links[0].source.finishingPositions).toMatchObject([1]);
  expect(links[0].target.roundNumber).toEqual(1);
  expect(links[0].target.feedProfile).toEqual(DRAW);

  expect(links[1].linkType).toEqual(POSITION);
  expect(links[1].source.finishingPositions).toMatchObject([2]);
  expect(links[1].target.roundNumber).toEqual(1);
  expect(links[1].target.feedProfile).toEqual(DRAW);
});

it('can generate Round Robins 16 with playoffs', () => {
  reset();
  initialize();
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  mainDrawPositions({ drawSize: 16 });
  const structureOptions = {
    playoffGroups: [
      { finishingPositions: [1], structureName: 'Gold Flight' },
      { finishingPositions: [2], structureName: 'Silver Flight' },
    ],
  };
  const {
    mainStructure,
    playoffStructures,
    links,
  } = drawEngine.generateDrawType({
    drawType,
    structureOptions,
  });

  expect(mainStructure.stage).toEqual(MAIN);
  expect(mainStructure.structures.length).toEqual(4);

  expect(playoffStructures.length).toEqual(2);
  expect(playoffStructures[0].structureName).toEqual('Gold Flight');
  expect(playoffStructures[1].structureName).toEqual('Silver Flight');

  expect(playoffStructures[0].stage).toEqual(PLAY_OFF);
  expect(playoffStructures[0].finishingPosition).toEqual(ROUND_OUTCOME);
  expect(playoffStructures[0].matchUps.length).toEqual(3);
  expect(playoffStructures[0].matchUps[0].finishingRound).toEqual(2);

  expect(links.length).toEqual(2);
  expect(links[0].linkType).toEqual(POSITION);
  expect(links[0].source.finishingPositions).toMatchObject([1]);
  expect(links[0].target.roundNumber).toEqual(1);
  expect(links[0].target.feedProfile).toEqual(DRAW);

  expect(links[1].linkType).toEqual(POSITION);
  expect(links[1].source.finishingPositions).toMatchObject([2]);
  expect(links[1].target.roundNumber).toEqual(1);
  expect(links[1].target.feedProfile).toEqual(DRAW);
});

it('can generate Round Robin with Playoffs', () => {
  reset();
  initialize();
  const drawSize = 20;
  const groupSize = 5;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  const structureOptions = {
    groupSize,
    playoffGroups: [
      { finishingPositions: [1], structureName: 'Gold Flight' },
      { finishingPositions: [2], structureName: 'Silver Flight' },
      { finishingPositions: [3], structureName: 'Bronze Flight' },
      { finishingPositions: [4], structureName: 'Green Flight' },
      { finishingPositions: [5], structureName: 'Yellow Flight' },
    ],
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    drawType,
    drawSize,
    structureOptions,
  });

  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN
  );
  const playoffStructures = drawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAY_OFF
        ? structures.concat(structure)
        : structures;
    },
    []
  );
  expect(mainStructure.structures.length).toEqual(4);
  expect(mainStructure.structures[0].positionAssignments.length).toEqual(5);
  expect(playoffStructures.length).toEqual(5);
  expect(playoffStructures[0].positionAssignments.length).toEqual(4);
});

it('can advance players in Round Robin with Playoffs', () => {
  reset();
  initialize();
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

  const { tournamentRecord, participants } = generateTournament({
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

  expect(drawDefinition.links.length).toEqual(playoffStructuresCount);

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

  expect(playoffStructures.length).toEqual(4);
  expect(playoffStructures[0].positionAssignments.length).toEqual(4);

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
  mainStructure.structures.forEach((structure) => {
    const { structureId } = structure;
    const structureMatchUps = eventMatchUps.filter(
      (matchUp) => matchUp.structureId === structureId
    );
    const { participantResults } = drawEngine.tallyParticipantResults({
      matchUps: structureMatchUps,
      matchUpFormat,
    });
    Object.keys(participantResults).forEach((key) => {
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
    drawEngine.automatedPositioning({ structureId });

    // verify that positioning participants are expected
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
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
    expect(expectedParticipantIds.length).toEqual(groupsCount);
  });

  const allPlayoffPositionsFilled = drawEngine.allPlayoffPositionsFilled({
    structureId: mainStructure.structureId,
  });
  expect(allPlayoffPositionsFilled).toEqual(true);
});

it('can advance players in Round Robin with Playoffs with 5 per playoff structure', () => {
  reset();
  initialize();
  const drawSize = 20;
  const groupSize = 4;
  const groupsCount = drawSize / groupSize;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  const playoffStructuresCount = 5; // 3 x SINGLE_ELIMINATION + 1 FMLC (SINGLE_ELIMINATION + CONSOLATION)
  const structureOptions = {
    groupSize,
    playoffGroups: [
      {
        finishingPositions: [1],
        structureName: 'Gold Flight',
        drawType: FMLC,
      },
      {
        finishingPositions: [2],
        structureName: 'Silver Flight',
        drawType: SINGLE_ELIMINATION,
      },
      { finishingPositions: [3], structureName: 'Bronze Flight' },
      { finishingPositions: [4], structureName: 'Green Flight' },
    ],
  };

  const { tournamentRecord, participants } = generateTournament({
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

  expect(drawDefinition.links.length).toEqual(playoffStructuresCount);

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

  expect(playoffStructures.length).toEqual(4);
  expect(playoffStructures[0].positionAssignments.length).toEqual(8);

  const playoffStructureIds = playoffStructures.map(
    (structure) => structure.structureId
  );

  const positioningLinks = drawDefinition.links.filter(
    (link) => link.linkType === POSITION
  );

  const loserLinks = drawDefinition.links.filter(
    (link) => link.linkType === LOSER
  );

  expect(loserLinks.length).toEqual(1);
  expect(
    playoffStructureIds.includes(loserLinks[0].source.structureId)
  ).toEqual(true);

  positioningLinks.forEach((link) => {
    expect(link.source.structureId).toEqual(mainStructure.structureId);
    const targetIsPlayoffStructure = playoffStructureIds.includes(
      link.target.structureId
    );
    expect(targetIsPlayoffStructure).toEqual(true);
  });

  const consolationStructures = drawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === CONSOLATION
        ? structures.concat(structure)
        : structures;
    },
    []
  );

  expect(consolationStructures.length).toEqual(1);
  expect(consolationStructures[0].structureId).toEqual(
    loserLinks[0].target.structureId
  );

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
    drawEngine.automatedPositioning({ participants, structureId });

    // verify that positioning participants are expected
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
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
    expect(expectedParticipantIds.length).toEqual(groupsCount);

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

  const allPlayoffPositionsFilled = drawEngine.allPlayoffPositionsFilled({
    structureId: mainStructure.structureId,
  });
  expect(allPlayoffPositionsFilled).toEqual(true);

  // These finishing positions may not seem intuitive because there is overlap from one sructure to the next
  // HOWEVER, since there are playoff structures which in this instance are only receiving 5 participants,
  // there are 3 finishing positions which will not be claimed in each playoff structure...
  // so these values are CORRECT!
  expect(
    playoffStructures[0].matchUps[0].finishingPositionRange.winner
  ).toEqual([1, 4]);
  expect(
    playoffStructures[0].matchUps[0].finishingPositionRange.loser
  ).toEqual([5, 8]);

  expect(
    playoffStructures[1].matchUps[0].finishingPositionRange.winner
  ).toEqual([6, 9]);
  expect(
    playoffStructures[1].matchUps[0].finishingPositionRange.loser
  ).toEqual([10, 13]);

  expect(
    playoffStructures[2].matchUps[0].finishingPositionRange.winner
  ).toEqual([11, 14]);
  expect(
    playoffStructures[2].matchUps[0].finishingPositionRange.loser
  ).toEqual([15, 18]);

  expect(
    playoffStructures[3].matchUps[0].finishingPositionRange.winner
  ).toEqual([16, 19]);
  expect(
    playoffStructures[3].matchUps[0].finishingPositionRange.loser
  ).toEqual([20, 23]);
});
