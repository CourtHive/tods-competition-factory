import {
  SCORE_TEST_KEYS,
  OUTCOME_ABANDONED,
  STATUS_ABANDONED,
  STATUS_DEFAULT,
  STATUS_RETIREMENT,
  STATUS_SUSPENDED,
  STATUS_INTERRUPTED,
} from '../constants';
import { scoreMatchUp, enterValues } from './primitives';

import { utilities } from 'tods-competition-factory';
const { generateRange, randomMember } = utilities;

export function stressTests({ matchUpFormat, setTo, games2Win = 2 }) {
  singleSetStressTests({ matchUpFormat, setTo });

  it('can enter retirement or default after second set if match is incomplete', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 2, value: '1' },
      { lowSide: 1, value: '1' },
      { lowSide: 2, value: 'r' },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`${setTo}-1 1-${setTo} RET`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);
    expect(matchUp?.winningSide).toEqual(1);
  });

  it('retains spacing after side 1 outcome is removed', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 2, value: '1' },
      { lowSide: 1, value: 'r' },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`RET ${setTo}-1`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);
    expect(matchUp?.winningSide).toEqual(2);

    ({ matchUp } = scoreMatchUp({ value: 'backspace', lowSide: 1, matchUp }));
    expect(matchUp?.score).toEqual(`${setTo}-1 `);

    ({ matchUp } = scoreMatchUp({ value: '2', lowSide: 1, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`${setTo}-1 2-${setTo}`);
  });

  it('does not allow additional score entry after outcomes', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 2, value: '1' },
      { lowSide: 2, value: 'r' },
      { lowSide: 2, value: '3' },
      { lowSide: 2, value: '2' },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`${setTo}-1 RET`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);
    expect(matchUp?.winningSide).toEqual(1);
  });

  it('appropriately handles abandoned status', () => {
    const matchUp = { score: undefined, sets: [], matchUpFormat };

    const { matchUp: scoredMatchUp, updated } = scoreMatchUp({
      value: 'a',
      lowSide: 1,
      matchUp,
    });
    expect(updated).toEqual(true);
    expect(scoredMatchUp?.score.trim()).toEqual(OUTCOME_ABANDONED);
    expect(scoredMatchUp?.winningSide).toEqual(undefined);
    expect(scoredMatchUp?.matchUpStatus).toEqual(STATUS_ABANDONED);

    const values = [
      { value: 'backspace' },
      { lowSide: 2, value: '1' },
      { lowSide: 2, value: 'a' },
    ];

    const { matchUp: matchUpWithValues } = enterValues({
      values,
      matchUp: scoredMatchUp,
    });
    expect(matchUpWithValues?.score.trim()).toEqual(`${setTo}-1 ABN`);
    expect(matchUpWithValues?.matchUpStatus).toEqual(STATUS_ABANDONED);
    expect(matchUpWithValues?.winningSide).toEqual(undefined);
  });

  it('can support second set match status outcomes', () => {
    let updated;
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    // can't enter interrupted when no score has been entered
    ({ matchUp, updated } = scoreMatchUp({ value: 'i', lowSide: 1, matchUp }));
    expect(updated).toEqual(undefined);
    expect(matchUp?.score || undefined).toEqual(undefined);
    expect(matchUp?.winningSide).toEqual(undefined);

    // can't enter suspended when no score has been entered
    ({ matchUp, updated } = scoreMatchUp({ value: 's', lowSide: 1, matchUp }));
    expect(updated).toEqual(undefined);
    expect(matchUp?.score || undefined).toEqual(undefined);
    expect(matchUp?.winningSide).toEqual(undefined);

    // can't enter retirement when no score has been entered
    ({ matchUp } = scoreMatchUp({ value: 'r', lowSide: 1, matchUp }));
    expect(matchUp?.score).toEqual('DEF ');
    expect(matchUp?.winningSide).toEqual(2);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_DEFAULT);

    let values = [
      { value: 'backspace' },
      { lowSide: 2, value: 1 },
      { lowSide: 2, value: 'r' },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score).toEqual(`${setTo}-1 RET`);
    expect(matchUp?.winningSide).toEqual(1);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);

    values = [{ value: 'backspace' }, { lowSide: 1, value: 'r' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`RET ${setTo}-1`);
    expect(matchUp?.winningSide).toEqual(2);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);

    values = [{ value: 'backspace' }, { lowSide: 1, value: 's' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`SUS ${setTo}-1`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_SUSPENDED);
    expect(matchUp?.winningSide).toEqual(undefined);

    values = [{ value: 'backspace' }, { lowSide: 2, value: 's' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`${setTo}-1 SUS`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_SUSPENDED);
    expect(matchUp?.winningSide).toEqual(undefined);

    values = [{ value: 'backspace' }, { lowSide: 1, value: 'i' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`INT ${setTo}-1`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_INTERRUPTED);
    expect(matchUp?.winningSide).toEqual(undefined);

    values = [{ value: 'backspace' }, { lowSide: 2, value: 'i' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score).toEqual(`${setTo}-1 INT`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_INTERRUPTED);
    expect(matchUp?.winningSide).toEqual(undefined);
  });

  it('preserves space between set scores after outcome removal', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 2, value: 1 },
      { lowSide: 2, value: 'r' },
      { value: 'backspace' },
      { lowSide: 2, value: 1 },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp.score.trim()).toEqual(`${setTo}-1 ${setTo}-1`);

    if (games2Win === 2) {
      expect(matchUp?.sets?.length).toEqual(2);
      expect(matchUp?.winningSide).toEqual(1);
    }
  });
}

export function singleSetStressTests({ matchUpFormat, setTo }) {
  it('entering - multiple times does nothing after first action', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 2, value: 3 },
      { value: '-' },
      { value: '-' },
      { value: '-' },
      { value: '-' },
      { value: '-' },
      { value: '-' },
      { lowSide: 2, value: 1 },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score?.trim()).toEqual(`${setTo}-1`);
    expect(matchUp?.sets?.length).toEqual(1);
    expect(matchUp?.sets[0].winningSide).toEqual(1);
  });

  it('supports use of - to modify side 2 score', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 2, value: 2 },
      { value: '-' },
      { lowSide: 2, value: 1 },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp.score.trim()).toEqual(`${setTo}-1`);
    expect(matchUp?.sets?.length).toEqual(1);
    expect(matchUp?.sets[0].winningSide).toEqual(1);
  });

  it('can recover from randomly generated inputs', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const keyCount = 20;

    let values = generateRange(0, keyCount).map(() => {
      return {
        lowSide: randomMember([1, 2]),
        value: randomMember(SCORE_TEST_KEYS),
      };
    });

    ({ matchUp } = enterValues({ values, matchUp }));

    values = generateRange(0, 4).map(() => {
      return { value: 'backspace' };
    });

    ({ matchUp } = enterValues({ values, matchUp }));

    values = generateRange(0, keyCount).map(() => {
      return {
        lowSide: randomMember([1, 2]),
        value: randomMember(SCORE_TEST_KEYS),
      };
    });

    ({ matchUp } = enterValues({ values, matchUp }));

    values = generateRange(0, keyCount * 2).map(() => {
      return { value: 'backspace' };
    });

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp.score || undefined).toBeUndefined();
  });

  it('can enter retirement or default for incomplete first set', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 1, value: '1' },
      { lowSide: 2, value: '-' },
      { lowSide: 2, value: '1' },
      { lowSide: 2, value: 'r' },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`1-1 RET`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);
    expect(matchUp?.winningSide).toEqual(1);

    ({ matchUp } = scoreMatchUp({ value: 'backspace', matchUp }));
    ({ matchUp } = scoreMatchUp({ value: 'd', matchUp }));
    expect(matchUp?.score.trim()).toEqual(`DEF 1-1`);
  });

  it('does not allow additional 1st set score entry after outcomes', () => {
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    const values = [
      { lowSide: 1, value: '1' },
      { lowSide: 2, value: '-' },
      { lowSide: 2, value: '1' },
      { lowSide: 2, value: 'r' },
      { lowSide: 2, value: '3' },
      { lowSide: 2, value: '2' },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`1-1 RET`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);
    expect(matchUp?.winningSide).toEqual(1);
  });

  it('can support 1st set match status outcomes', () => {
    let updated;
    let matchUp = { score: undefined, sets: [], matchUpFormat };

    // can't enter interrupted when no score has been entered
    ({ matchUp, updated } = scoreMatchUp({ value: 'i', lowSide: 1, matchUp }));
    expect(updated).toEqual(undefined);
    expect(matchUp?.score || undefined).toEqual(undefined);
    expect(matchUp?.winningSide).toEqual(undefined);

    // can't enter suspended when no score has been entered
    ({ matchUp, updated } = scoreMatchUp({ value: 's', lowSide: 1, matchUp }));
    expect(updated).toEqual(undefined);
    expect(matchUp?.score || undefined).toEqual(undefined);
    expect(matchUp?.winningSide).toEqual(undefined);

    // can't enter retirement when no score has been entered
    ({ matchUp } = scoreMatchUp({ value: 'r', lowSide: 1, matchUp }));
    expect(matchUp?.score).toEqual('DEF ');
    expect(matchUp?.winningSide).toEqual(2);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_DEFAULT);

    let values = [
      { value: 'backspace' },
      { lowSide: 1, value: 1 },
      { lowSide: 2, value: '-' },
      { lowSide: 2, value: 1 },
      { lowSide: 2, value: 'r' },
    ];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score).toEqual(`1-1 RET`);
    expect(matchUp?.winningSide).toEqual(1);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);

    values = [{ value: 'backspace' }, { lowSide: 1, value: 'r' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`RET 1-1`);
    expect(matchUp?.winningSide).toEqual(2);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_RETIREMENT);

    values = [{ value: 'backspace' }, { lowSide: 1, value: 's' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`SUS 1-1`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_SUSPENDED);
    expect(matchUp?.winningSide).toEqual(undefined);

    values = [{ value: 'backspace' }, { lowSide: 2, value: 's' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`1-1 SUS`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_SUSPENDED);
    expect(matchUp?.winningSide).toEqual(undefined);

    values = [{ value: 'backspace' }, { lowSide: 1, value: 'i' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score.trim()).toEqual(`INT 1-1`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_INTERRUPTED);
    expect(matchUp?.winningSide).toEqual(undefined);

    values = [{ value: 'backspace' }, { lowSide: 2, value: 'i' }];

    ({ matchUp } = enterValues({ values, matchUp }));
    expect(matchUp?.score).toEqual(`1-1 INT`);
    expect(matchUp?.matchUpStatus).toEqual(STATUS_INTERRUPTED);
    expect(matchUp?.winningSide).toEqual(undefined);
  });
}
