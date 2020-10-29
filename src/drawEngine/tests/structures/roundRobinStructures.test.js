import drawEngine from '../../../drawEngine';
import tournamentEngine from '../../../tournamentEngine';

import { tournamentRecordWithParticipants } from '../../../tournamentEngine/tests/primitives';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';

import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { setsValues } from './roundRobinSetsValues.js';

import {
  DRAW,
  ITEM,
  FMLC,
  MAIN,
  PLAYOFF,
  POSITION,
  CONTAINER,
  WIN_RATIO,
  WATERFALL,
  ROUND_ROBIN,
  ROUND_OUTCOME,
  ROUND_ROBIN_WITH_PLAYOFF,
  ELIMINATION,
  CONSOLATION,
  LOSER,
} from '../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can generate Round Robin Main Draws', () => {
  reset();
  initialize();
  const drawType = ROUND_ROBIN;
  mainDrawPositions({ drawSize: 16 });
  let { structure } = drawEngine.generateDrawType({ drawType });
  expect(structure.structureType).toEqual(CONTAINER);
  expect(structure.finishingPosition).toEqual(WIN_RATIO);
  expect(structure.structures.length).toEqual(4);
  expect(structure.structures[0].structureType).toEqual(ITEM);
  expect(structure.structures[0].matchUps.length).toEqual(6);

  reset();
  initialize();
  mainDrawPositions({ drawSize: 32 });
  ({ structure } = drawEngine.generateDrawType({ drawType }));
  expect(structure.structures.length).toEqual(8);
});

it('can generate Round Robins with varying group sizes', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 30 });
  let options = { groupSize: 5 };
  let { structure } = drawEngine.generateDrawType({
    drawType: ROUND_ROBIN,
    structureOptions: options,
  });
  expect(structure.structures.length).toEqual(6);
  expect(structure.structures[0].matchUps.length).toEqual(10);
  expect(structure.structures[0].matchUps[0].drawPositions).toMatchObject([
    1,
    2,
  ]);
  expect(structure.structures[0].matchUps[1].drawPositions).toMatchObject([
    3,
    4,
  ]);

  reset();
  initialize();
  mainDrawPositions({ drawSize: 30 });
  options = { groupSize: 3 };
  ({ structure } = drawEngine.generateDrawType({
    drawType: ROUND_ROBIN,
    structureOptions: options,
  }));
  expect(structure.structures.length).toEqual(10);
  expect(structure.structures[0].matchUps.length).toEqual(3);
  expect(structure.structures[0].matchUps[0].roundNumber).toEqual(1);
  expect(structure.structures[0].matchUps[1].roundNumber).toEqual(2);
  expect(structure.structures[0].matchUps[2].roundNumber).toEqual(3);
  expect(structure.structures[0].matchUps[0].drawPositions).toMatchObject([
    1,
    2,
  ]);
  expect(structure.structures[0].matchUps[1].drawPositions).toMatchObject([
    2,
    3,
  ]);
  expect(structure.structures[0].matchUps[2].drawPositions).toMatchObject([
    1,
    3,
  ]);
});

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

  expect(playoffStructures[0].stage).toEqual(PLAYOFF);
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

  expect(playoffStructures[0].stage).toEqual(PLAYOFF);
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
    structure => structure.stage === MAIN
  );
  const playoffStructures = drawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAYOFF
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

it('Round Robin with Playoffs testbed', () => {
  reset();
  initialize();
  const drawSize = 20;
  const groupSize = 4;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
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
        drawType: ELIMINATION,
      },
      { finishingPositions: [3], structureName: 'Bronze Flight' },
      { finishingPositions: [4], structureName: 'Green Flight' },
    ],
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

  expect(drawDefinition.links.length).toEqual(5);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const mainStructure = drawDefinition.structures.find(
    structure => structure.stage === MAIN
  );

  expect(mainStructure.structures.length).toEqual(5);
  expect(mainStructure.structures[0].positionAssignments.length).toEqual(4);

  const playoffStructures = drawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAYOFF
        ? structures.concat(structure)
        : structures;
    },
    []
  );

  expect(playoffStructures.length).toEqual(4);
  expect(playoffStructures[0].positionAssignments.length).toEqual(8);

  const playoffStructureIds = playoffStructures.map(
    structure => structure.structureId
  );

  const positioningLinks = drawDefinition.links.filter(
    link => link.linkType === POSITION
  );

  const loserLinks = drawDefinition.links.filter(
    link => link.linkType === LOSER
  );

  expect(loserLinks.length).toEqual(1);
  expect(
    playoffStructureIds.includes(loserLinks[0].source.structureId)
  ).toEqual(true);

  positioningLinks.forEach(link => {
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
      expect([1, 2, 3, 4].includes(groupOrder)).toEqual(true);
    });
  });

  playoffStructures.forEach(structure => {
    const { structureId } = structure;
    drawEngine.automatedPositioning({ structureId });
  });
  // ({ drawDefinition } = drawEngine.getState());
});
