import { getPositionsPlayedOff } from '../../governors/structureGovernor/getPositionsPlayedOff';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import { drawEngine } from '../../sync';
import { expect, it } from 'vitest';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';

it('can correctly determin positions playedOff for STANDARD_ELIMINATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.generateDrawTypeAndModifyDrawDefinition();
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();
  const structureIds = drawDefinition.structures.map((s) => s.structureId);

  const { positionsPlayedOff } = getPositionsPlayedOff({
    drawDefinition,
    structureIds,
  });
  expect(positionsPlayedOff).toEqual([1, 2]);
});

it('can correctly determin positions playedOff for FIRST_MATCH_LOSER_CONSOLATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.generateDrawTypeAndModifyDrawDefinition({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(result.success).toEqual(true);
  const structureIds = result.drawDefinition.structures.map(
    (s) => s.structureId
  );

  const { drawDefinition } = drawEngine.getState();

  const { positionsPlayedOff } = getPositionsPlayedOff({
    drawDefinition,
    structureIds,
  });
  expect(positionsPlayedOff).toEqual([1, 2, 9, 10]);
});
