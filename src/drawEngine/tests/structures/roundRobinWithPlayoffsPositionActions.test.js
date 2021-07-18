import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { reset, initialize } from '../primitives/primitives';
import { setsValues } from './roundRobinSetsValues.js';
import { intersection } from '../../../utilities';

import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

import {
  MAIN,
  PLAY_OFF,
  POSITION,
  WATERFALL,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { LUCKY_LOSER } from '../../../constants/entryStatusConstants';

import POLICY_SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';
import {
  ASSIGN_BYE,
  ASSIGN_PARTICIPANT,
  REMOVE_ASSIGNMENT,
} from '../../../constants/positionActionConstants';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';

it('disables placement actions for Round Robin Playoffs until all groups are complete', () => {
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

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: drawSize },
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

it('Playoff drawPosition assignment includes group winners who lost no matchUps', () => {
  reset();
  initialize();
  const drawSize = 8;
  const groupSize = 4;
  const groupsCount = drawSize / groupSize;
  const structureOptions = {
    groupSize,
    playoffGroups: [{ finishingPositions: [1], structureName: 'Gold Flight' }],
  };

  const drawProfiles = [
    {
      drawSize,
      eventType: SINGLES,
      participantsCount: drawSize,
      drawType: ROUND_ROBIN_WITH_PLAYOFF,
      structureOptions,
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: drawSize },
    completeAllMatchUps: true,
    drawProfiles,
  });
  // const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const matchUpFormat = 'SET3-S:6/TB7';

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

  expect(playoffStructures.length).toEqual(1);
  expect(playoffStructures[0].positionAssignments.length).toEqual(2);

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
    });
  };

  mainStructure.structures.forEach((structure, structureOrder) => {
    completeStructures(structure, structureOrder);
  });

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
    drawDefinition,
  });

  const firstAssignment = positionAssignments[0];
  expect(firstAssignment.extensions[0].value.matchUpsWon).toEqual(3);
  expect(firstAssignment.extensions[0].value.matchUpsLost).toEqual(0);
  const { participantId } = firstAssignment;

  const structureId = playoffStructureIds[0];
  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { structureIds: [structureId] },
  });
  expect(matchUps.length).toEqual(1);
  const { matchUpId } = matchUps[0];
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);

  // first test with POLICY_SEEDING_USTA included in policyDefinition
  let drawPosition = 1;
  let policyDefinition = Object.assign(
    {},
    POLICY_POSITION_ACTIONS_UNRESTRICTED,
    POLICY_SEEDING_USTA
  );
  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition,
  });
  expect(result.validActions.length).not.toEqual(0);

  let validActionTypes = result.validActions.map(({ type }) => type);
  expect(validActionTypes.includes(LUCKY_LOSER)).toEqual(false);
  expect(validActionTypes.includes(ASSIGN_BYE)).toEqual(true);

  drawPosition = 2;
  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition,
  });

  validActionTypes = result.validActions.map(({ type }) => type);
  expect(validActionTypes.includes(LUCKY_LOSER)).toEqual(false);
  expect(validActionTypes.includes(ASSIGN_BYE)).toEqual(true);
  expect(validActionTypes.includes(REMOVE_ASSIGNMENT)).toEqual(true);

  // remove one assignment to test available actions
  let { method, payload } = result.validActions.find(
    ({ type }) => type === REMOVE_ASSIGNMENT
  );
  result = tournamentEngine[method](payload);

  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition,
  });
  const assignmentAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );

  // expect that a participant who losts no matchUps is available for placement
  expect(
    assignmentAction.availableParticipantIds.includes(participantId)
  ).toEqual(true);
  expect(assignmentAction.availableParticipantIds.length).toEqual(7);

  // now test with seed position enforced (default behavior)
  drawPosition = 1;
  policyDefinition = POLICY_POSITION_ACTIONS_UNRESTRICTED;
  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition,
  });
  expect(result.validActions.length).not.toEqual(0);

  validActionTypes = result.validActions.map(({ type }) => type);
  expect(validActionTypes.includes(LUCKY_LOSER)).toEqual(false);
  expect(
    intersection(validActionTypes, [REMOVE_ASSIGNMENT, ASSIGN_BYE]).length
  ).toEqual(2);

  drawPosition = 2;
  result = tournamentEngine.positionActions({
    drawId,
    structureId: playoffStructureIds[0],
    drawPosition,
    policyDefinition,
  });

  validActionTypes = result.validActions.map(({ type }) => type);
  expect(validActionTypes.includes(LUCKY_LOSER)).toEqual(false);
  expect(
    intersection(validActionTypes, [ASSIGN_PARTICIPANT, ASSIGN_BYE]).length
  ).toEqual(2);
});
