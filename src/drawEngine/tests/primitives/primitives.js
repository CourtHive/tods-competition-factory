import { drawEngine } from '../../sync';
import { generateRange } from '../../../utilities';
import { getStageEntries } from '../../getters/stageGetter';
import { getDrawStructures } from '../../getters/findStructure';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getStructureMatchUps } from '../../getters/getMatchUps/getStructureMatchUps';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import {
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

let result;

export function reset() {
  result = drawEngine.reset();
  expect(result).toMatchObject(SUCCESS);
  const { drawDefinition: state } = drawEngine.getState();
  expect(state).toEqual(undefined);
}

export function initialize({ drawId = 'uuid-default' } = {}) {
  result = drawEngine.newDrawDefinition({ drawId });
  expect(result).toMatchObject(SUCCESS);
  return result;
}

export function qualifyingDrawPositions({ drawSize = 4 } = {}) {
  result = drawEngine.setStageDrawSize({ stage: QUALIFYING, drawSize });
  expect(result).toMatchObject(SUCCESS);
}

export function mainDrawPositions({ drawSize = 2 } = {}) {
  result = drawEngine.setStageDrawSize({ stage: MAIN, drawSize });
  expect(result).toMatchObject(SUCCESS);
}

export function mainDrawWithEntries({
  drawType,
  drawSize = 4,
  byesCount = 0,
} = {}) {
  reset();
  initialize();
  result = drawEngine.setStageDrawSize({ stage: MAIN, drawSize });
  expect(result).toMatchObject(SUCCESS);
  const participantsToAdd = drawSize - byesCount;
  const participants = generateRange(0, participantsToAdd).map((i) => ({
    participantId: `uuid${i}`,
  }));
  const participantIds = participants.map((p) => p.participantId);
  result = drawEngine.addDrawEntries({ participantIds, stage: MAIN });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.devContext(true).generateDrawType({ drawType });
  return result;
}

export function eliminationMatchUpsWithParticipants({ drawSize }) {
  const stage = MAIN;
  mainDrawWithEntries({ drawSize });
  let { drawDefinition } = drawEngine.getState();
  const {
    structures: [firstStructure],
  } = getDrawStructures({ drawDefinition, stage });
  const { structureId } = firstStructure;

  const allDrawMatchUps = drawEngine.drawMatchUps();
  expect(allDrawMatchUps.upcomingMatchUps.length).toEqual(0);
  expect(allDrawMatchUps.pendingMatchUps.length).toEqual(drawSize - 1);

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
    const result = drawEngine.assignDrawPosition({
      structureId,
      drawPosition,
      participantId,
    });
    expect(result).toMatchObject(SUCCESS);
    ({ drawDefinition } = drawEngine.getState());
    const {
      unassignedPositions: stillUnassigned,
    } = structureAssignedDrawPositions({ drawDefinition, structureId });
    expect(stillUnassigned.length).toEqual(participantIds.length - 1 - i);
  });

  ({ drawDefinition } = drawEngine.getState());
  const { assignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });
  expect(assignedPositions.length).toEqual(drawSize);
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });
  const { upcomingMatchUps: upcomingStructureMatchUps } = getStructureMatchUps({
    structure,
    drawDefinition,
    requireParticipants: true,
  });
  expect(upcomingStructureMatchUps.length).toEqual(drawSize / 2);

  const {
    upcomingMatchUps,
    pendingMatchUps,
    completedMatchUps,
  } = drawEngine.drawMatchUps();
  expect(upcomingMatchUps.length).toEqual(drawSize / 2);
  expect(pendingMatchUps.length).toEqual(drawSize / 2 - 1);
  expect(completedMatchUps.length).toEqual(0);
  return {
    matchUps: { upcomingMatchUps, pendingMatchUps, completedMatchUps },
  };
}
