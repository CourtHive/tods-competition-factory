import { drawEngine } from '../../sync';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';

import {
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

it('can add 3-4 playoff structure to a SINGLE ELIMINATION structure', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    playoffPositions: [3, 4],
    drawSize: 16,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(1);
  expect(structures.length).toEqual(2);
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure by playoffPositions', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    drawSize: 16,
    playoffPositions: [5, 6, 7, 8],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure by a single playoff position', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    drawSize: 16,
    playoffPositions: [5],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
});

it('can add 3-8 playoff structures to a SINGLE ELIMINATION by a single playoff position from each structure', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    drawSize: 16,
    playoffPositions: [3, 5],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(4);
});

it('can add 3-8 playoff structures to a SINGLE ELIMINATION by roundNumbers', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    drawSize: 16,
    roundNumbers: [2, 3],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(4);
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure by roundNumbers', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    drawSize: 16,
    roundNumbers: [2],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
});

it('can add 3-4 playoff structure to a FIRST_MATCH_LOSER_CONSOLATION structure', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    drawSize: 16,
    playoffPositions: [3, 4],
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(3);
});

function drawEngineAddStructuresTest({
  drawSize,
  drawType,
  playoffPositions,
  roundNumbers,
}) {
  reset();
  initialize();
  mainDrawPositions({ drawSize, drawType });
  let result = drawEngine.devContext(true).generateDrawType({ drawType });
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();
  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN
  );
  result = drawEngine.devContext(true).addPlayoffStructures({
    structureId: mainStructure.structureId,
    playoffPositions,
    roundNumbers,
  });
  return result;
}
