import { isValidMatchUpFormat } from '../../drawEngine/governors/matchUpGovernor/isValidMatchUpFormat';
import {
  getSetComplement,
  getTiebreakComplement,
} from '../../drawEngine/governors/scoreGovernor/getComplement';
import { analyzeMatchUp } from '../../drawEngine/governors/scoreGovernor/analyzeMatchUp';
import { analyzeSet } from '../../drawEngine/governors/scoreGovernor/analyzeSet';
import { matchUpFormatCode } from 'tods-matchup-format-code';
import { randomInt } from '../../utilities/math';
import { generateRange } from '../../utilities';

import {
  INVALID_MATCHUP_FORMAT,
  INVALID_VALUES,
} from '../../constants/errorConditionConstants';

import {
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  RETIRED,
  WALKOVER,
  matchUpStatusConstants,
} from '../../constants/matchUpStatusConstants';
import { matchUpScore } from '../../drawEngine/governors/scoreGovernor/matchUpScore';

// percentages rounded to the nearest whole number
const defaultStatusProfile = {
  [WALKOVER]: 2,
  [DOUBLE_WALKOVER]: 1,
  [RETIRED]: 1,
  [DEFAULTED]: 4,
};

/**
 *
 * @param {integer} winningSide - optional - 1 or 2 forces the winningSide
 * @param {integer} sideWeight - the larger the number the less likely a deciding (e.g. 3rd) set is generated
 * @param {string} matchUpFormat - TODS matchUpFormat code string
 * @param {object} matchUpStatusProfile - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
 *
 * @returns {object} outcome - { score, winningSide, matchUpStatus }
 */
export function generateOutcome({
  winningSide,
  sideWeight = 4,
  matchUpFormat = 'SET3-S:6/TB7',
  matchUpStatusProfile = defaultStatusProfile, // { matchUpStatusProfile: {} } will always return only { matchUpStatus: COMPLETED }
}) {
  if (!isValidMatchUpFormat(matchUpFormat))
    return { error: INVALID_MATCHUP_FORMAT };
  if (typeof matchUpStatusProfile !== 'object')
    return { error: INVALID_VALUES };

  const matchUpStatuses = Object.keys(matchUpStatusProfile).filter(
    (matchUpStatus) =>
      Object.keys(matchUpStatusConstants).includes(matchUpStatus) &&
      matchUpStatus !== COMPLETED
  );
  const matchUpStatusTotals = Object.keys(matchUpStatuses).reduce(
    (total, key) => total + matchUpStatusProfile[key],
    0
  );
  if (matchUpStatusTotals > 100)
    return { error: INVALID_VALUES, matchUpStatusProfile };

  const matchUpStatusMap = matchUpStatuses.reduce(
    (statusMap, matchUpStatus) => {
      statusMap.pointer =
        statusMap.pointer + matchUpStatusProfile[matchUpStatus];
      statusMap.valueMap.push([statusMap.pointer, matchUpStatus]);
      return statusMap;
    },
    { pointer: 0, valueMap: [] }
  );

  const outcomePointer = randomInt(1, 100);
  const matchUpStatus = (matchUpStatusMap.valueMap.find(
    (item) => outcomePointer <= item[0]
  ) || [100, COMPLETED])[1];

  const parsedFormat = matchUpFormatCode.parse(matchUpFormat);

  const { bestOf, setFormat, finalSetFormat } = parsedFormat;

  const sets = [];
  const weightedSide = randomInt(0, 1);
  const weightedRange = winningSide
    ? [2 - winningSide]
    : [
        ...generateRange(0, sideWeight).map(() => weightedSide),
        1 - weightedSide,
      ];

  for (const setNumber of generateRange(1, bestOf + 1)) {
    const isFinalSet = setNumber === bestOf;
    const set = generateSet(
      setNumber,
      (isFinalSet && finalSetFormat) || setFormat,
      weightedRange
    );
    sets.push(set);
    const analysis = analyzeMatchUp({ matchUp: { sets, matchUpFormat } });
    if (analysis.calculatedWinningSide) break;
  }

  const analysis = analyzeMatchUp({ matchUp: { sets, matchUpFormat } });

  const { score } = matchUpScore({
    score: { sets },
    winningSide: analysis.calculatedWinningSide,
    matchUpStatus,
  });

  const outcome = {
    score,
    winningSide: analysis.calculatedWinningSide,
    matchUpStatus,
  };

  return { parsedFormat, outcome };
}

/**
 *
 * @param {integer} setNumber
 * @param {object} setFormat
 * @param {integer[]} weightedRange - weights one side to reduce the number of "deciding sets", e.g. 3 set matchUps
 * @returns
 */
function generateSet(setNumber, setFormat, weightedRange = [0, 1]) {
  const set = { setNumber };
  const { setTo, tiebreakFormat, tiebreakAt, timed, minutes } = setFormat;
  if (timed && minutes) {
    //
  } else {
    // weight the range of possible low scores such that tiebreak sets are less likely
    const range = generateRange(1, setTo + 1)
      .map((value) => generateRange(0, setTo + 2 - value).map(() => value))
      .flat();
    const lowValue = range[randomInt(0, range.length - 1)];

    const scores = getSetComplement({
      isSide1: true,
      lowValue,
      setTo,
      tiebreakAt,
    });

    // will tend to be more likely to either reverse or not revderse all sets
    // preserves randomness of winningSide while reducing deciding set outcomes
    const weightIndex = randomInt(0, weightedRange.length - 1);
    const reverseScores = weightedRange[weightIndex];
    if (reverseScores) scores.reverse();

    const [side1Score, side2Score] = scores;
    Object.assign(set, { side1Score, side2Score });

    const setAnalysis = analyzeSet({
      setObject: set,
      matchUpScoringFormat: { setFormat },
    });

    if (setAnalysis.hasTiebreakCondition) {
      const { NoAD: tiebreakNoAd, tiebreakTo } = tiebreakFormat;
      const range = generateRange(1, tiebreakTo + 1)
        .map((value) =>
          generateRange(0, tiebreakTo + 2 - value).map(() => value)
        )
        .flat();
      const lowValue = range[randomInt(0, range.length - 1)];
      const scores = getTiebreakComplement({
        isSide1: true,
        lowValue,
        tiebreakTo,
        tiebreakNoAd,
      });

      if (setAnalysis.leadingSide === 2) {
        [set.side1TiebreakScore, set.side2TiebreakScore] = scores;
      } else {
        [set.side2TiebreakScore, set.side1TiebreakScore] = scores;
      }
    }

    set.winningSide = setAnalysis.winningSide || setAnalysis.leadingSide;
  }
  return set;
}
