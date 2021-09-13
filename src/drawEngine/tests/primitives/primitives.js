import { drawEngine } from '../../sync';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
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
