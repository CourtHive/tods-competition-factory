import { generateDrawTypeAndModifyDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { assignDrawPosition } from '../../../mutate/matchUps/drawPositions/positionAssignment';
import { setStageDrawSize } from '../../governors/entryGovernor/stageEntryCounts';
import { structureAssignedDrawPositions } from '../../../query/drawDefinition/positionsGetter';
import { getDrawStructures } from '../../../acquire/findStructure';
import { getStageEntries } from '../../../query/drawDefinition/stageGetter';
import { newDrawDefinition } from '../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import { ERROR, SUCCESS } from '../../../constants/resultConstants';
import { EntryStatusUnion } from '../../../types/tournamentTypes';
import { generateRange } from '../../../utilities';
import {
  MAIN,
  ROUND_ROBIN,
  CONTAINER,
} from '../../../constants/drawDefinitionConstants';
import {
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/entryStatusConstants';

let result;

it('can assign SINGLE_ELIMINATION draw drawPositions', () => {
  const stage = MAIN;
  const drawSize = 4;

  const { drawDefinition } = mocksEngine.generateEventWithDraw({
    drawProfile: {
      automated: false,
      drawSize,
    },
  });

  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryStatuses: EntryStatusUnion[] = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = getStageEntries({
    drawDefinition,
    entryStatuses,
    stage,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);

  const { structureId } = structure;
  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(unassignedPositions?.length).toEqual(participantIds.length);

  // expect it to fail if an invalid drawPosition is attempted
  const participantId = participantIds[0];
  result = assignDrawPosition({
    drawPosition: 0,
    drawDefinition,
    participantId,
    structureId,
  });
  expect(result).toHaveProperty(ERROR);

  participantIds.forEach((participantId, i) => {
    const drawPosition = unassignedPositions?.[i].drawPosition;
    result = assignDrawPosition({
      participantId,
      drawDefinition,
      drawPosition,
      structureId,
    });
    expect(result).toMatchObject(SUCCESS);
    const { unassignedPositions: stillUnassigned } =
      structureAssignedDrawPositions({ drawDefinition, structureId });
    expect(stillUnassigned?.length).toEqual(participantIds.length - 1 - i);
  });

  const { assignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(assignedPositions?.length).toEqual(drawSize);

  // can't assign a player a second time
  const drawPosition = unassignedPositions?.[0].drawPosition;
  result = assignDrawPosition({
    drawDefinition,
    participantId,
    drawPosition,
    structureId,
  });
  expect(result).toHaveProperty(ERROR);
});

it('can assign ROUND_ROBIN draw drawPositions', () => {
  const { drawDefinition } = mocksEngine.generateEventWithDraw({
    uuids: generateRange(0, 100)
      .reverse()
      .map((i) => `uuid${i}`),
    drawProfile: {
      drawType: ROUND_ROBIN,
      automated: false,
      drawSize: 16,
    },
  });

  const stage = MAIN;
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });
  const { structureId } = structure;
  expect(structure.structureType).toEqual(CONTAINER);
  expect(structure.structures?.length).toEqual(4);

  const entryStatuses: EntryStatusUnion[] = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = getStageEntries({
    drawDefinition,
    entryStatuses,
    stage,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);

  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(unassignedPositions?.length).toEqual(participantIds.length);

  participantIds.forEach((participantId, i) => {
    const drawPosition = unassignedPositions?.[i].drawPosition;
    result = assignDrawPosition({
      drawDefinition,
      participantId,
      drawPosition,
      structureId,
    });
    expect(result).toMatchObject(SUCCESS);
    const { unassignedPositions: stillUnassigned } =
      structureAssignedDrawPositions({ drawDefinition, structureId });
    expect(stillUnassigned?.length).toEqual(participantIds.length - 1 - i);
  });

  const { assignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(assignedPositions?.length).toEqual(16);

  const groups = drawDefinition.structures[0].structures;
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
  const drawPosition = unassignedPositions?.[0].drawPosition;
  result = assignDrawPosition({
    drawDefinition,
    participantId,
    drawPosition,
    structureId,
  });
  expect(result).toHaveProperty(ERROR);
});

it('returns positionAssignments for SINGLE_ELIMINATION and ROUND_ROBIN strucures', () => {
  let drawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 16 });
  const elimination = generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
  }).structures?.[0];
  const { positionAssignments: eliminationAssignments } =
    structureAssignedDrawPositions({ structure: elimination });
  expect(eliminationAssignments?.length).toEqual(16);

  drawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 16 });
  const drawType = ROUND_ROBIN;
  const roundRobin = generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
    drawType,
  }).structures?.[0];
  const { positionAssignments: roundRobinAssignments } =
    structureAssignedDrawPositions({ structure: roundRobin });
  expect(roundRobinAssignments?.length).toEqual(16);
});
