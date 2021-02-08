import drawEngine from '../sync';
import { reset, initialize } from './primitives/primitives';
import definitionTemplate from '../generators/drawDefinitionTemplate';

import {
  MAIN,
  QUALIFYING,
  CONSOLATION,
} from '../../constants/drawDefinitionConstants';
import { ERROR, SUCCESS } from '../../constants/resultConstants';

let result;

it('can initialize', () => {
  initialize();
});

it('can load definition', () => {
  result = drawEngine.setState(definitionTemplate());
  expect(result).toHaveProperty(ERROR);
  const template = Object.assign({}, definitionTemplate(), { drawId: 'foo' });
  drawEngine.setState(template);
  ({ drawDefinition: result } = drawEngine.getState());
  expect(result).toHaveProperty('drawId');
  expect(result.drawId).toEqual('foo');
});

it('can reset state', () => {
  reset();
});

it('can configure drawSize for all stages', () => {
  reset();
  initialize({ drawId: 'uuid-abc' });
  result = drawEngine.setStageDrawSize({ stage: QUALIFYING, drawSize: 8 });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageDrawSize({ stage: MAIN, drawSize: 8 });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageDrawSize({ stage: CONSOLATION, drawSize: 8 });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageDrawSize({ stage: 'INVALID', drawSize: 8 });
  expect(result).toHaveProperty(ERROR);
});

it('can initialize, setState, and query', () => {
  result = drawEngine.reset();
  expect(result).toMatchObject(SUCCESS);
  initialize({ drawId: 'uuid-xyz' });
  const { drawDefinition } = drawEngine.getState();
  drawEngine.reset();
  const { drawDefinition: drawDefinitionCopy } = drawEngine
    .setState(drawDefinition)
    .getState();
  const { drawId } = drawDefinitionCopy;
  expect(drawId).toEqual('uuid-xyz');
});

it('can set draw description', () => {
  const drawDescription = 'Draw Description';
  drawEngine.setDrawDescription({ description: drawDescription });
  const { drawDefinition: state } = drawEngine.getState();
  expect(state.description).toEqual(drawDescription);
});
