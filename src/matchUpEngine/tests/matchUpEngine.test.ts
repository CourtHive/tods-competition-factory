import matchUpEngineAsync from '../async';
import matchUpEngineSync from '../sync';
import { expect, it } from 'vitest';

import {
  INVALID_OBJECT,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

const asyncMatchUpEngine = matchUpEngineAsync(true);

it.each([matchUpEngineSync, asyncMatchUpEngine])(
  'throws appropriate errors',
  async (matchUpEngine) => {
    let result = await matchUpEngine.setState();
    expect(result.error).toEqual(MISSING_VALUE);
    result = await matchUpEngine.setState('foo');
    expect(result.error).toEqual(INVALID_OBJECT);

    const matchUp: any = { matchUpId: '123' };
    result = await matchUpEngine.setState([matchUp]);
    expect(result.success).toEqual(true);

    result = await matchUpEngine.getState();
    expect(result).toEqual(matchUp);

    result = await matchUpEngine.reset();
    expect(result.success).toEqual(true);
    result = await matchUpEngine.getState();
    expect(result).toEqual(undefined);

    result = await matchUpEngine.setState([matchUp], false);
    expect(result.success).toEqual(true);
    result = await matchUpEngine.getState();
    expect(result).toEqual(matchUp);

    matchUp.someAttribute = 'ABC';
    result = await matchUpEngine.getState();
    expect(result).toEqual(matchUp);

    result = await matchUpEngine.setState([matchUp], true);
    expect(result.success).toEqual(true);
    matchUp.anotherAttribute = 'XYZ';

    result = await matchUpEngine.getState();
    expect(result).not.toEqual(matchUp);
    expect(result).toEqual({ matchUpId: '123', someAttribute: 'ABC' });

    result = await matchUpEngine.version();
    expect(result).not.toBeUndefined();

    result = await matchUpEngine.devContext({ foo: true });
    expect(result.success).toEqual(true);
  }
);
