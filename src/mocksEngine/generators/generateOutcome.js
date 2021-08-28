import { analyzeMatchUp } from '../../drawEngine/governors/scoreGovernor/analyzeMatchUp';
import { matchUpScore } from '../../drawEngine/governors/scoreGovernor/matchUpScore';
import { analyzeSet } from '../../drawEngine/governors/scoreGovernor/analyzeSet';
import { randomInt, weightedRandom } from '../../utilities/math';
import { matchUpFormatCode } from 'tods-matchup-format-code';
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

// TODO: timed sets && NoAd

/**
 *
 * @param {string} matchUpFormat - optional - TODS matchUpFormat code string - defaults to 'SET3-S:6/TB7'
 * @param {object} matchUpStatusProfile - optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
 * @param {integer} pointsPerMinute - optional - value used for generating scores for timed sets
 * @param {integer} sideWeight - optional - the larger the number the less likely a deciding (e.g. 3rd) set is generated
 * @param {integer} winningSide - optional - 1 or 2 forces the winningSide
 * @param {integer} defaultWithScorePercent - optional - percentage of the time a DEFAULT should include a score
 *
 * @returns {object} outcome - { score, winningSide, matchUpStatus }
 */
export function generateOutcome({
  matchUpFormat = 'SET3-S:6/TB7',
  matchUpStatusProfile = defaultStatusProfile, // { matchUpStatusProfile: {} } will always return only { matchUpStatus: COMPLETED }
  pointsPerMinute = 1,
  sideWeight = 4,
  winningSide,
  defaultWithScorePercent = 2,
}) {
  if (!matchUpFormatCode.isValidMatchUpFormat(matchUpFormat))
    return { error: INVALID_MATCHUP_FORMAT };
  if (typeof matchUpStatusProfile !== 'object')
    return { error: INVALID_VALUES };
  if (defaultWithScorePercent > 100) defaultWithScorePercent = 100;
  if (
    isNaN(defaultWithScorePercent) ||
    isNaN(pointsPerMinute) ||
    isNaN(sideWeight)
  )
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
    ? [winningSide - 1]
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
      incomplete: incompleteAt === setNumber,
      matchUpStatus,
      pointsPerMinute,
      setFormat: (isFinalSet && finalSetFormat) || setFormat,
      setNumber,
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
  incomplete,
  matchUpStatus,
  pointsPerMinute,
  setFormat,
  setNumber,
  weightedRange = [0, 1],
}) {
  const set = { setNumber };
  const { setTo, tiebreakFormat, tiebreakAt, tiebreakSet, timed, minutes } =
    setFormat;

  // will tend to be more likely to either reverse or not revderse all sets
  // preserves randomness of winningSide while reducing deciding set outcomes
  const weightIndex = randomInt(0, weightedRange.length - 1);
  const reverseScores = weightedRange[weightIndex];
  let winningSideNumber;

  if (timed) {
    const calcPoints = minutes * pointsPerMinute;
    const pointsVariation = Math.round(calcPoints * 0.2);
    const totalPoints = calcPoints + randomPop([1, -1]) * pointsVariation;
    // the use of weightedRandom applies a bell curve distribution to the difference in side scores
    // the larger the second value, the more pronounced the bell curve will be
    const sidePoints = weightedRandom(totalPoints, 2);
    const scores = [sidePoints, totalPoints - sidePoints];

    if (reverseScores) scores.reverse();
    winningSideNumber = weightedRange[weightIndex] + 1;

    // sides could be tied
    let highSide = scores[0] > scores[1] ? 1 : scores[1] > scores[0] ? 2 : 0;

    if (incomplete) {
      const [side1Score, side2Score] = scores;
      Object.assign(set, { side1Score, side2Score });
      if (completedMatchUpStatuses.includes(matchUpStatus)) {
        return { set, incomplete, winningSideNumber };
      }

      return { set, incomplete };
    }

    if (!highSide) scores[randomInt(0, 1)] += 1;
    highSide = scores[0] > scores[1] ? 1 : 2; // sides are not tied
    if (highSide !== winningSideNumber) scores.reverse();

    const [side1Score, side2Score] = scores;
    Object.assign(set, {
      side1Score,
      side2Score,
      winningSide: winningSideNumber,
    });

    return { set };
  } else if (incomplete) {
    set.side1Score = randomInt(0, tiebreakAt);
    set.side2Score = randomInt(0, tiebreakAt);

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

    const scores =
      setTo &&
      getSetComplement({
        isSide1: true,
        lowValue,
        setTo,
        tiebreakAt,
      });
    const isTiebreakSet = !scores;
    const specifiedWinningSide =
      weightedRange.length === 1 && weightedRange[weightIndex] + 1;

    if (!isTiebreakSet) {
      if (specifiedWinningSide) {
        const highSide = scores[0] > scores[1] ? 1 : 2; // sides are not tied
        if (highSide !== specifiedWinningSide) scores.reverse();
      } else if (reverseScores) {
        scores.reverse();
      }

      const [side1Score, side2Score] = scores;
      Object.assign(set, { side1Score, side2Score });
    }

    const setAnalysis = analyzeSet({
      setObject: set,
      matchUpScoringFormat: { setFormat },
    });

    let tiebreakWinningSide;
    if (setAnalysis.hasTiebreakCondition || isTiebreakSet) {
      const { NoAD: tiebreakNoAd, tiebreakTo } = tiebreakFormat || tiebreakSet;
      const range = generateRange(1, tiebreakTo + 1)
        .map((value) =>
          generateRange(0, tiebreakTo + 2 - value).map(() => value)
        )
        .flat();
      const lowValue = range[randomInt(0, range.length - 1)];
      let scores = getTiebreakComplement({
        isSide1: true,
        lowValue,
        tiebreakTo,
        tiebreakNoAd,
      });

      if (isTiebreakSet) {
        const highSide = scores[0] > scores[1] ? 1 : 2; // sides are not tied
        if (specifiedWinningSide) {
          if (highSide !== specifiedWinningSide) scores.reverse();
        } else if (reverseScores) {
          scores.reverse();
        }
        [set.side1TiebreakScore, set.side2TiebreakScore] = scores;
        tiebreakWinningSide = scores[0] > scores[1] ? 1 : 2;
      } else if (setAnalysis.leadingSide === 2) {
        [set.side1TiebreakScore, set.side2TiebreakScore] = scores;
      } else {
        [set.side2TiebreakScore, set.side1TiebreakScore] = scores;
      }
    }

    set.winningSide =
      setAnalysis.winningSide ||
      setAnalysis.leadingSide ||
      specifiedWinningSide ||
      tiebreakWinningSide;
  }
  return { set };
}
