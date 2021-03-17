import drawEngine from '../../sync';
import tournamentEngine from '../../../tournamentEngine/sync';

import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';
import { isCompletedStructure } from '../../governors/queryGovernor/structureActions';
import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { reset, initialize } from '../primitives/primitives';
import { setsValues } from './roundRobinSetsValues.js';

import {
  MAIN,
  PLAY_OFF,
  POSITION,
  WATERFALL,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';

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
  const { drawId } = drawDefinition;

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

  let drawPosition = 1;
  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition: POLICY_POSITION_ACTIONS_UNRESTRICTED,
  });
  expect(result.validActions.length).toEqual(0);

  positioningLinks.forEach((link) => {
    expect(link.source.structureId).toEqual(mainStructure.structureId);
    const targetIsPlayoffStructure = playoffStructureIds.includes(
      link.target.structureId
    );
    expect(targetIsPlayoffStructure).toEqual(true);
  });

  const {
    matchUps: allStructureMatchUps,
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { structureIds: [mainStructure.structureId] },
    inContext: true,
  });
  const allStructureMatchUpsCount = allStructureMatchUps.length;
  const matchUpsPerStructure =
    allStructureMatchUpsCount / (drawSize / groupSize);

  const completeStructures = (structure, structureOrder) => {
    const values = setsValues[structureOrder];
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
  };

  mainStructure.structures.slice(0, 2).forEach((structure, structureOrder) => {
    completeStructures(structure, structureOrder);
  });
  drawPosition = 1;
  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition: POLICY_POSITION_ACTIONS_UNRESTRICTED,
  });
  expect(result.validActions.length).toEqual(0);
  mainStructure.structures.slice(2).forEach((structure, structureOrder) => {
    completeStructures(structure, structureOrder + 2);
  });

  const { matchUps: eventMatchUps } = tournamentEngine.allEventMatchUps({
    eventId,
    inContext: true,
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
    tournamentEngine.automatedPositioning({
      drawId,
      structureId,
    });
  });

  drawPosition = 1;
  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition: POLICY_POSITION_ACTIONS_UNRESTRICTED,
  });
  expect(result.validActions.length).not.toEqual(0);
});
