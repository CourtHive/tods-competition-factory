import { isValidMatchUpFormat } from '../../drawEngine/governors/matchUpGovernor/isValidMatchUpFormat';
import { analyzeMatchUp } from '../../drawEngine/governors/scoreGovernor/analyzeMatchUp';
import { matchUpScore } from '../../drawEngine/governors/scoreGovernor/matchUpScore';
import { analyzeSet } from '../../drawEngine/governors/scoreGovernor/analyzeSet';
import { matchUpFormatCode } from 'tods-matchup-format-code';
import { randomInt } from '../../utilities/math';
import { generateRange, randomPop } from '../../utilities';
import {
  getSetComplement,
  getTiebreakComplement,
} from '../../drawEngine/governors/scoreGovernor/getComplement';

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
  INCOMPLETE,
  SUSPENDED,
  matchUpStatusConstants,
  completedMatchUpStatuses,
} from '../../constants/matchUpStatusConstants';

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
 * @param {integer} defaultWithScorePercent - percentage of the time a DEFAULT should include a score
 * @param {string} matchUpFormat - TODS matchUpFormat code string
 * @param {object} matchUpStatusProfile - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
 *
 * @returns {object} outcome - { score, winningSide, matchUpStatus }
 */
export function generateOutcome({
  winningSide,
  sideWeight = 4,
  defaultWithScorePercent = 2,
  matchUpFormat = 'SET3-S:6/TB7',
  matchUpStatusProfile = defaultStatusProfile, // { matchUpStatusProfile: {} } will always return only { matchUpStatus: COMPLETED }
}) {
  if (!isValidMatchUpFormat(matchUpFormat))
    return { error: INVALID_MATCHUP_FORMAT };
  if (typeof matchUpStatusProfile !== 'object')
    return { error: INVALID_VALUES };
  if (defaultWithScorePercent > 100) defaultWithScorePercent = 100;
  if (isNaN(sideWeight) || isNaN(defaultWithScorePercent))
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

  const noScore = { sets: [], side1ScoreString: '', side2ScoreString: '' };
  if ([WALKOVER, DEFAULTED].includes(matchUpStatus)) {
    winningSide = winningSide || randomInt(1, 2);
    const outcome = {
      score: noScore,
      winningSide,
      matchUpStatus,
    };

    const scoreDefaulted =
      matchUpStatus === DEFAULTED &&
      randomInt(1, 100) > 100 - defaultWithScorePercent;
    if (!scoreDefaulted) return { outcome };
  } else if (matchUpStatus === DOUBLE_WALKOVER) {
    return { outcome: { score: noScore, matchUpStatus } };
  }

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

  const incompleteSet = [RETIRED, DEFAULTED, INCOMPLETE, SUSPENDED].includes(
    matchUpStatus
  );

  // if there is to be an incomplete set randomize which set is incomplete
  // for 3 sets this will always be setNumber 1 or setNumber 2
  // because it is not known in advance whether 3 sets will be generated
  const incompleteAt =
    incompleteSet && (randomPop(generateRange(1, bestOf)) || 1);

  // used to capture winner by RETIREMENT or DEFAULT
  let weightedWinningSide;

  for (const setNumber of generateRange(1, bestOf + 1)) {
    const isFinalSet = setNumber === bestOf;
    const { set, incomplete, winningSideNumber } = generateSet({
      setNumber,
      incomplete: incompleteAt === setNumber,
      setFormat: (isFinalSet && finalSetFormat) || setFormat,
      matchUpStatus,
      weightedRange,
    });
    sets.push(set);

    if (incomplete) {
      weightedWinningSide = winningSideNumber;
      break;
    }

    const analysis = analyzeMatchUp({ matchUp: { sets, matchUpFormat } });
    if (analysis.calculatedWinningSide) break;
  }

  const analysis = analyzeMatchUp({ matchUp: { sets, matchUpFormat } });

  const matchUpWinningSide = weightedWinningSide
    ? winningSide || weightedWinningSide
    : analysis.calculatedWinningSide;

  // add the side perspective stringScores
  const { score } = matchUpScore({
    score: { sets },
    winningSide: matchUpWinningSide,
    matchUpStatus,
  });

  const outcome = {
    score,
    winningSide: matchUpWinningSide,
    matchUpStatus,
  };

  return { outcome };
}

/**
 *
 * @param {integer} setNumber
 * @param {object} setFormat
 * @param {integer[]} weightedRange - weights one side to reduce the number of "deciding sets", e.g. 3 set matchUps
 * @returns
 */
function generateSet({
  setNumber,
  incomplete,
  setFormat,
  weightedRange = [0, 1],
  matchUpStatus,
}) {
  const set = { setNumber };
  const { setTo, tiebreakFormat, tiebreakAt, timed, minutes } = setFormat;

  // will tend to be more likely to either reverse or not revderse all sets
  // preserves randomness of winningSide while reducing deciding set outcomes
  const weightIndex = randomInt(0, weightedRange.length - 1);
  const reverseScores = weightedRange[weightIndex];

  if (timed && minutes) {
    return { set };
  } else if (incomplete) {
    set.side1Score = randomInt(0, tiebreakAt);
    set.side2Score = randomInt(0, tiebreakAt);

    let winningSideNumber;

    if (completedMatchUpStatuses.includes(matchUpStatus)) {
      winningSideNumber = weightedRange[weightIndex] + 1;
    }

    return { set, incomplete, winningSideNumber };
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
  return { set };
}
