import drawEngineAsync from '../../drawEngine/async';
import drawEngine from '../../drawEngine/sync';
import { reset, initialize } from './primitives/primitives';
import definitionTemplate from '../generators/drawDefinitionTemplate';

import {
  MAIN,
  QUALIFYING,
  CONSOLATION,
} from '../../constants/drawDefinitionConstants';
import { ERROR, SUCCESS } from '../../constants/resultConstants';

const asyncDrawEngine = drawEngineAsync(true);
let result;

it('can initialize', () => {
  initialize();
});

it.each([drawEngine, asyncDrawEngine])(
  'can load definition',
  async (drawEngine) => {
    result = await drawEngine.setState(definitionTemplate());
    expect(result).toHaveProperty(ERROR);
    const template = { ...definitionTemplate(), drawId: 'foo' };
    drawEngine.setState(template);
    ({ drawDefinition: result } = await drawEngine.getState());
    expect(result).toHaveProperty('drawId');
    expect(result.drawId).toEqual('foo');
  }
);

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

  result = drawEngine.setStageAlternatesCount({
    stage: QUALIFYING,
    alternatesCount: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageAlternatesCount({
    stage: MAIN,
    alternatesCount: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageAlternatesCount({
    stage: CONSOLATION,
    alternatesCount: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageAlternatesCount({
    stage: 'INVALID',
    alternatesCount: 8,
  });
  expect(result).toHaveProperty(ERROR);

  result = drawEngine.setStageWildcardsCount({
    stage: QUALIFYING,
    wildcardsCount: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageWildcardsCount({
    stage: MAIN,
    wildcardsCount: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageWildcardsCount({
    stage: CONSOLATION,
    wildcardsCount: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageWildcardsCount({
    stage: 'INVALID',
    wildcardsCount: 8,
  });
  expect(result).toHaveProperty(ERROR);

  result = drawEngine.setStageQualifiersCount({
    stage: QUALIFYING,
    qualifiersCount: 8,
  });
  expect(result).toHaveProperty(ERROR);
  result = drawEngine.setStageQualifiersCount({
    stage: MAIN,
    qualifiersCount: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = drawEngine.setStageQualifiersCount({
    stage: CONSOLATION,
    qualifiersCount: 8,
  });
  expect(result).toHaveProperty(ERROR);
  result = drawEngine.setStageQualifiersCount({
    stage: 'INVALID',
    qualifiersCount: 8,
  });
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

it.each([drawEngine, asyncDrawEngine])(
  'can set draw description',
  async (drawEngine) => {
    const drawDescription = 'Draw Description';
    await drawEngine
      .devContext(true)
      .setDrawDescription({ description: drawDescription });
    const { drawDefinition: state } = await drawEngine.getState();
    expect(state.description).toEqual(drawDescription);
  }
);
