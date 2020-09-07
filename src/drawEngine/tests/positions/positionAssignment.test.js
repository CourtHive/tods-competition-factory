import { getDrawDefinition, drawEngine } from 'competitionFactory/drawEngine';
import { stageEntries } from 'competitionFactory/drawEngine/getters/stageGetter';
import { drawStructures } from 'competitionFactory/drawEngine/getters/structureGetter';
import { mainDrawWithEntries } from 'competitionFactory/drawEngine/tests/primitives/primitives';
import { reset, initialize, mainDrawPositions } from 'competitionFactory/drawEngine/tests/primitives/primitives';

import { structureAssignedDrawPositions } from 'competitionFactory/drawEngine/getters/positionsGetter';

import {
  MAIN, ROUND_ROBIN, CONTAINER, DIRECT_ACCEPTANCE, WILDCARD
} from 'competitionFactory/constants/drawDefinitionConstants';

import { ERROR, SUCCESS } from 'competitionFactory/constants/resultConstants';

let result;

it('can assign KNOCKOUT draw drawPositions', () => {
  const stage = MAIN;
  const drawSize = 4;
  mainDrawWithEntries({drawSize});
  const { drawDefinition } = getDrawDefinition();
  const { structures: [structure]} = drawStructures({drawDefinition, stage});
  
  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = stageEntries({stage, drawDefinition, entryTypes});
  const participantIds = mainDrawEntries.map(e => e.participantId);
  
  const { structureId } = structure;
  const { unassignedPositions } = structureAssignedDrawPositions({ drawDefinition, structureId });
  expect(unassignedPositions.length).toEqual(participantIds.length);
 
  // expect it to fail if a bogus participantId is used to assign a position
  result = drawEngine.assignDrawPosition({structureId, drawPosition: 1, participantId: 'bogusId'});
  expect(result).toHaveProperty(ERROR);

  // expect it to fail if an invalid drawPosition is attempted
  const participantId = participantIds[0];
  result = drawEngine.assignDrawPosition({structureId, drawPosition: 0, participantId});
  expect(result).toHaveProperty(ERROR);

  participantIds.forEach((participantId, i) => {
    const drawPosition = unassignedPositions[i].drawPosition;
    result = drawEngine.assignDrawPosition({structureId, drawPosition, participantId});
    expect(result).toMatchObject(SUCCESS);
    const { unassignedPositions: stillUnassigned } = structureAssignedDrawPositions({ drawDefinition, structureId });
    expect(stillUnassigned.length).toEqual(participantIds.length - 1 - i);
  });
  
  const { assignedPositions } = structureAssignedDrawPositions({ drawDefinition, structureId });
  expect(assignedPositions.length).toEqual(drawSize);

  // can't assign a player a second time
  let drawPosition = unassignedPositions[0].drawPosition;
  result = drawEngine.assignDrawPosition({structureId, drawPosition, participantId});
  expect(result).toHaveProperty(ERROR);
});

it('can assign ROUND ROBIN draw drawPositions', () => {
  mainDrawWithEntries({drawSize: 16, drawType: ROUND_ROBIN});
  const stage = MAIN;
  const { drawDefinition } = getDrawDefinition();
  const { structures: [structure]} = drawStructures({drawDefinition, stage});
  const { structureId } = structure;
  expect(structure.structureType).toEqual(CONTAINER);
  expect(structure.structures.length).toEqual(4);
  
  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = stageEntries({stage, drawDefinition, entryTypes});
  const participantIds = mainDrawEntries.map(e => e.participantId);
  
  const { unassignedPositions } = structureAssignedDrawPositions({ drawDefinition, structureId });
  expect(unassignedPositions.length).toEqual(participantIds.length);

  participantIds.forEach((participantId, i) => {
    const drawPosition = unassignedPositions[i].drawPosition;
    result = drawEngine.assignDrawPosition({structureId, drawPosition, participantId});
    expect(result).toMatchObject(SUCCESS);
    const { unassignedPositions: stillUnassigned } = structureAssignedDrawPositions({ drawDefinition, structureId });
    expect(stillUnassigned.length).toEqual(participantIds.length - 1 - i);
  });
  
  const { assignedPositions } = structureAssignedDrawPositions({ drawDefinition, structureId });
  expect(assignedPositions.length).toEqual(16);

  const state = drawEngine.getState();
  const groups = state.structures[0].structures;
  groups.forEach((group, i) => {
    const positionAssignments = group.positionAssignments;   
    positionAssignments.forEach((assignment, j) => {
      const expectedParticipant = i*4+j;
      const expectedUUID = `uuid${expectedParticipant}`;
      expect(assignment.participantId).toEqual(expectedUUID);
    });
  });

  // can't assign a player a second time
  let participantId = participantIds[0];
  let drawPosition = unassignedPositions[0].drawPosition;
  result = drawEngine.assignDrawPosition({structureId, drawPosition, participantId});
  expect(result).toHaveProperty(ERROR);
});

it('returns positionAssignments for KNOCKOUT and ROUND_ROBIN strucures', () => {
  reset();
  initialize();
  mainDrawPositions({drawSize: 16});
  const { structure: knockout } = drawEngine.generateDrawType();
  const { positionAssignments: knockoutAssignments } = structureAssignedDrawPositions({structure: knockout});
  expect(knockoutAssignments.length).toEqual(16);
  
  reset();
  initialize();
  const drawType = ROUND_ROBIN;
  mainDrawPositions({drawSize: 16});
  let { structure: roundRobin } = drawEngine.generateDrawType({drawType});
  let { positionAssignments: roundRobinAssignments } = structureAssignedDrawPositions({structure: roundRobin});
  expect(roundRobinAssignments.length).toEqual(16);
});
