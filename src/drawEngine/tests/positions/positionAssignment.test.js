import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getDrawStructures } from '../../getters/findStructure';
import { getStageEntries } from '../../getters/stageGetter';
import { drawEngine } from '../../sync';
import { mocksEngine } from '../../..';
import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../tests/primitives/primitives';

import { ERROR, SUCCESS } from '../../../constants/resultConstants';
import {
  MAIN,
  ROUND_ROBIN,
  CONTAINER,
} from '../../../constants/drawDefinitionConstants';
import {
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/entryStatusConstants';
import { generateRange } from '../../../utilities';

let result;

it('can assign SINGLE_ELIMINATION draw drawPositions', () => {
  const stage = MAIN;
  const drawSize = 4;

  let { drawDefinition } = mocksEngine.generateEventWithDraw({
    drawProfile: {
      automated: false,
      drawSize,
    },
  });
  drawEngine.setState(drawDefinition);

  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = getStageEntries({
    stage,
    drawDefinition,
    entryTypes,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);

  const { structureId } = structure;
  ({ drawDefinition } = drawEngine.getState());
  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(unassignedPositions.length).toEqual(participantIds.length);

  // expect it to fail if an invalid drawPosition is attempted
  const participantId = participantIds[0];
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition: 0,
    participantId,
  });
  expect(result).toHaveProperty(ERROR);

  participantIds.forEach((participantId, i) => {
    const drawPosition = unassignedPositions[i].drawPosition;
    result = drawEngine.assignDrawPosition({
      structureId,
      drawPosition,
      participantId,
    });
    expect(result).toMatchObject(SUCCESS);
    ({ drawDefinition } = drawEngine.getState());
    const { unassignedPositions: stillUnassigned } =
      structureAssignedDrawPositions({ drawDefinition, structureId });
    expect(stillUnassigned.length).toEqual(participantIds.length - 1 - i);
  });

  ({ drawDefinition } = drawEngine.getState());
  const { assignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(assignedPositions.length).toEqual(drawSize);

  // can't assign a player a second time
  const drawPosition = unassignedPositions[0].drawPosition;
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition,
    participantId,
  });
  expect(result).toHaveProperty(ERROR);
});

it('can assign ROUND_ROBIN draw drawPositions', () => {
  let { drawDefinition } = mocksEngine.generateEventWithDraw({
    uuids: generateRange(0, 100)
      .reverse()
      .map((i) => `uuid${i}`),
    drawProfile: {
      drawType: ROUND_ROBIN,
      automated: false,
      drawSize: 16,
    },
  });
  drawEngine.setState(drawDefinition);

  const stage = MAIN;
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });
  const { structureId } = structure;
  expect(structure.structureType).toEqual(CONTAINER);
  expect(structure.structures.length).toEqual(4);

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  ({ drawDefinition } = drawEngine.getState());
  const mainDrawEntries = getStageEntries({
    stage,
    drawDefinition,
    entryTypes,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);

  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(unassignedPositions.length).toEqual(participantIds.length);

  participantIds.forEach((participantId, i) => {
    const drawPosition = unassignedPositions[i].drawPosition;
    result = drawEngine.assignDrawPosition({
      structureId,
      drawPosition,
      participantId,
    });
    expect(result).toMatchObject(SUCCESS);
    ({ drawDefinition } = drawEngine.getState());
    const { unassignedPositions: stillUnassigned } =
      structureAssignedDrawPositions({ drawDefinition, structureId });
    expect(stillUnassigned.length).toEqual(participantIds.length - 1 - i);
  });

  ({ drawDefinition } = drawEngine.getState());
  const { assignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(assignedPositions.length).toEqual(16);

  const { drawDefinition: state } = drawEngine.getState();
  const groups = state.structures[0].structures;
  groups.forEach((group, i) => {
    const positionAssignments = group.positionAssignments;
    positionAssignments.forEach((assignment, j) => {
      const expectedParticipant = (i * 4 + j) * 2;
      const expectedUUID = `uuid${expectedParticipant}`;
      expect(expectedUUID).not.toBeUndefined();
      expect(assignment.participantId).toEqual(expectedUUID);
    });
  });

  // can't assign a player a second time
  const participantId = participantIds[0];
  const drawPosition = unassignedPositions[0].drawPosition;
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition,
    participantId,
  });
  expect(result).toHaveProperty(ERROR);
});

it('returns positionAssignments for SINGLE_ELIMINATION and ROUND_ROBIN strucures', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure: elimination } = drawEngine.generateDrawType();
  const { positionAssignments: eliminationAssignments } =
    structureAssignedDrawPositions({ structure: elimination });
  expect(eliminationAssignments.length).toEqual(16);

  reset();
  initialize();
  const drawType = ROUND_ROBIN;
  mainDrawPositions({ drawSize: 16 });
  const { structure: roundRobin } = drawEngine.generateDrawType({ drawType });
  const { positionAssignments: roundRobinAssignments } =
    structureAssignedDrawPositions({ structure: roundRobin });
  expect(roundRobinAssignments.length).toEqual(16);
});
