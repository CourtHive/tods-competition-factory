import { getSetComplement, getTiebreakComplement } from './getComplement';

it('can generate appropriate highValue for standard sets', () => {
  setScoreTest({ isSide1: true, lowValue: '3', setTo: 6, tiebreakAt: 6, expectation: [3, 6] });
  setScoreTest({ isSide1: false, lowValue: '3', setTo: 6, tiebreakAt: 6, expectation: [6, 3] });
  setScoreTest({ isSide1: true, lowValue: '3', setTo: 5, tiebreakAt: 4, expectation: [3, 5] });
  setScoreTest({ isSide1: false, lowValue: '3', setTo: 5, tiebreakAt: 4, expectation: [5, 3] });
  setScoreTest({ isSide1: true, lowValue: '4', setTo: 5, tiebreakAt: 4, expectation: [4, 5] });
  setScoreTest({ isSide1: false, lowValue: '4', setTo: 5, tiebreakAt: 4, expectation: [5, 4] });
  setScoreTest({ isSide1: true, lowValue: '5', setTo: 5, tiebreakAt: 4, expectation: [4, 5] });
  setScoreTest({ isSide1: true, lowValue: '2', setTo: 8, tiebreakAt: 8, expectation: [2, 8] });
  setScoreTest({ isSide1: true, lowValue: '8', setTo: 8, tiebreakAt: 8, expectation: [8, 9] });
  setScoreTest({ isSide1: true, lowValue: '8', setTo: 8, tiebreakAt: 7, expectation: [7, 8] });
  setScoreTest({ isSide1: true, lowValue: '7', setTo: 8, tiebreakAt: 7, expectation: [7, 8] });
});

it('correctly calculates high tiebreak values with Advantage', () => {
  tiebreakTest({ isSide1: true, lowValue: '2', tiebreakTo: 7, expectation: [2, 7] });
  tiebreakTest({ isSide1: false, lowValue: '2', tiebreakTo: 7, expectation: [7, 2] });
  tiebreakTest({ isSide1: true, lowValue: '7', tiebreakTo: 7, expectation: [7, 9] });
  tiebreakTest({ isSide1: false, lowValue: '7', tiebreakTo: 7, expectation: [9, 7] });
  tiebreakTest({ isSide1: true, lowValue: '99', tiebreakTo: 7, expectation: [99, 101] });
  tiebreakTest({ isSide1: false, lowValue: '99', tiebreakTo: 7, expectation: [101, 99] });
});

it('correctly calculates high tiebreak values with NOAD', () => {
  tiebreakTest({ tiebreakNoAd: true, isSide1: true, lowValue: '2', tiebreakTo: 7, expectation: [2, 7] });
  tiebreakTest({ tiebreakNoAd: true, isSide1: false, lowValue: '2', tiebreakTo: 7, expectation: [7, 2] });
  tiebreakTest({ tiebreakNoAd: true, isSide1: true, lowValue: '5', tiebreakTo: 7, expectation: [5, 7] });
  tiebreakTest({ tiebreakNoAd: true, isSide1: false, lowValue: '5', tiebreakTo: 7, expectation: [7, 5] });
  tiebreakTest({ tiebreakNoAd: true, isSide1: true, lowValue: '7', tiebreakTo: 7, expectation: [6, 7] });
  tiebreakTest({ tiebreakNoAd: true, isSide1: false, lowValue: '7', tiebreakTo: 7, expectation: [7, 6] });
  tiebreakTest({ tiebreakNoAd: true, isSide1: true, lowValue: '99', tiebreakTo: 7, expectation: [6, 7] });
  tiebreakTest({ tiebreakNoAd: true, isSide1: false, lowValue: '99', tiebreakTo: 7, expectation: [7, 6] });
});

interface SetScoreTestParams {
  isSide1: boolean;
  lowValue: string;
  setTo: number;
  tiebreakAt?: number;
  expectation: number[];
}

function setScoreTest(input: SetScoreTestParams) {
  let result = getSetComplement({...input});
  expect(result).toEqual(input.expectation);
}

interface TiebreakTestParams {
  isSide1: boolean;
  lowValue: string;
  tiebreakTo: number;
  tiebreakNoAd?: boolean;
  expectation: number[];
}
function tiebreakTest(input: TiebreakTestParams) {
  let result = getTiebreakComplement({...input});
  expect(result).toEqual(input.expectation);
}
