import { getSetComplement, getTiebreakComplement } from '@Query/matchUp/getComplement';
import { matchUpScore } from '@Assemblies/generators/matchUps/matchUpScore';
import { isValidMatchUpFormat } from '@Validators/isValidMatchUpFormat';
import { analyzeMatchUp } from '@Query/matchUp/analyzeMatchUp';
import { generateRange, randomPop } from '@Tools/arrays';
import { parse } from '@Helpers/matchUpFormatCode/parse';
import { randomInt, weightedRandom } from '@Tools/math';
import { analyzeSet } from '@Query/matchUp/analyzeSet';
import { isExit } from '@Validators/isExit';

// constants and fixtures
import { INVALID_MATCHUP_FORMAT, INVALID_VALUES } from '@Constants/errorConditionConstants';
import { FORMAT_STANDARD } from '@Fixtures/scoring/matchUpFormats';
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
  DOUBLE_DEFAULT,
} from '@Constants/matchUpStatusConstants';

// percentages rounded to the nearest whole number
const defaultStatusProfile = {
  [WALKOVER]: 2,
  [DOUBLE_WALKOVER]: 1,
  [DOUBLE_DEFAULT]: 1,
  [RETIRED]: 1,
  [DEFAULTED]: 4,
};

/**
 *
 * @param {string} matchUpFormat - optional - TODS matchUpFormat code string - defaults to 'SET3-S:6/TB7'
 * @param {object} matchUpStatusProfile - optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
 * @param {integer} pointsPerMinute - optional - value used for generating timed sets scores
 * @param {integer} sideWeight - optional - the larger the number the less likely a deciding (e.g. 3rd) set is generated
 * @param {integer} winningSide - optional - 1 or 2 forces the winningSide
 * @param {integer} defaultWithScorePercent - optional - percentage of the time a DEFAULT should include a score
 *
 * @returns {object} outcome - { score, winningSide, matchUpStatus }
 */
export function generateOutcome(params) {
  let { defaultWithScorePercent = 2, winningSide } = params;
  const {
    matchUpStatusProfile = defaultStatusProfile, // { matchUpStatusProfile: {} } will always return only { matchUpStatus: COMPLETED }
    matchUpFormat = FORMAT_STANDARD,
    pointsPerMinute = 2.5,
    sideWeight = 4,
  } = params;

  if (!isValidMatchUpFormat({ matchUpFormat })) return { error: INVALID_MATCHUP_FORMAT };
  if (typeof matchUpStatusProfile !== 'object') return { error: INVALID_VALUES };
  if (defaultWithScorePercent > 100) defaultWithScorePercent = 100;
  if (
    Number.isNaN(Number(defaultWithScorePercent)) ||
    Number.isNaN(Number(pointsPerMinute)) ||
    Number.isNaN(Number(sideWeight))
  )
    return { error: INVALID_VALUES };

  const matchUpStatuses = Object.keys(matchUpStatusProfile).filter(
    (matchUpStatus) => Object.keys(matchUpStatusConstants).includes(matchUpStatus) && matchUpStatus !== COMPLETED,
  );
  const matchUpStatusTotals = Object.keys(matchUpStatuses).reduce((total, key) => total + matchUpStatusProfile[key], 0);
  if (matchUpStatusTotals > 100) return { error: INVALID_VALUES, matchUpStatusProfile };

  const matchUpStatusMap = matchUpStatuses.reduce(
    (statusMap: { pointer: number; valueMap: any[][] }, matchUpStatus) => {
      statusMap.pointer = statusMap.pointer + matchUpStatusProfile[matchUpStatus];
      statusMap.valueMap.push([statusMap.pointer, matchUpStatus]);
      return statusMap;
    },
    { pointer: 0, valueMap: [] },
  );

  const outcomePointer = randomInt(1, 100);
  const matchUpStatus: string = (matchUpStatusMap.valueMap.find((item) => outcomePointer <= item[0]) ?? [
    100,
    COMPLETED,
  ])[1];

  const noScore = { sets: [], scoreStringSide1: '', side2ScoreString: '' };
  if (isExit(matchUpStatus)) {
    winningSide = winningSide || randomInt(1, 2);
    const outcome = {
      score: noScore,
      matchUpStatus,
      winningSide,
    };

    const scoreDefaulted = matchUpStatus === DEFAULTED && randomInt(1, 100) > 100 - defaultWithScorePercent;
    if (!scoreDefaulted) return { outcome };
  } else if ([DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUpStatus)) {
    return { outcome: { score: noScore, matchUpStatus } };
  }

  const parsedFormat = parse(matchUpFormat);

  const { bestOf = 1, exactly, setFormat, finalSetFormat } = parsedFormat ?? {};

  const sets: any[] = [];
  const weightedSide = randomInt(0, 1);
  const weightedRange = winningSide
    ? [winningSide - 1]
    : [...generateRange(0, sideWeight).map(() => weightedSide), 1 - weightedSide];

  const incompleteSet = [RETIRED, DEFAULTED, INCOMPLETE, SUSPENDED].includes(matchUpStatus);

  // if there is to be an incomplete set randomize which set is incomplete
  // for 3 sets this will always be setNumber 1 or setNumber 2
  // because it is not known in advance whether 3 sets will be generated
  const incompleteAt = incompleteSet && (randomPop(generateRange(1, exactly || bestOf)) || 1);

  // used to capture winner by RETIREMENT or DEFAULT
  let weightedWinningSide;

  const setsToGenerate = generateRange(1, (exactly ?? bestOf) + 1);
  for (const setNumber of setsToGenerate) {
    const isFinalSet = setNumber === (exactly ?? bestOf);
    const { set, incomplete, winningSideNumber } = generateSet({
      setFormat: (isFinalSet && finalSetFormat) || setFormat,
      incomplete: incompleteAt === setNumber,
      pointsPerMinute,
      matchUpStatus,
      weightedRange,
      setNumber,
    });
    sets.push(set);

    if (incomplete) {
      weightedWinningSide = winningSideNumber;
      break;
    }

    const analysis = analyzeMatchUp({ matchUp: { score: { sets }, matchUpFormat } });
    // For aggregate formats (e.g. SET2XA-S:T10), always play all sets — winner is by total points
    if (analysis.calculatedWinningSide && !parsedFormat?.aggregate) break;
  }

  let matchUpWinningSide;
  if (weightedWinningSide) {
    matchUpWinningSide = winningSide || weightedWinningSide;
  } else if (parsedFormat?.aggregate && sets.length > 0) {
    // Aggregate scoring: winner determined by total points across all sets
    let side1Total = sets.reduce((sum, s) => sum + (s.side1Score ?? 0), 0);
    let side2Total = sets.reduce((sum, s) => sum + (s.side2Score ?? 0), 0);
    // Resolve ties or enforce winningSide override
    const adjustSet = randomInt(0, sets.length - 1);
    if (winningSide) {
      // Ensure the forced winningSide has more total points
      if (
        (winningSide === 1 && side1Total <= side2Total) ||
        (winningSide === 2 && side2Total <= side1Total)
      ) {
        const diff = Math.abs(side1Total - side2Total) + randomInt(1, 3);
        if (winningSide === 1) sets[adjustSet].side1Score += diff;
        else sets[adjustSet].side2Score += diff;
      }
      matchUpWinningSide = winningSide;
    } else if (side1Total === side2Total) {
      const side = randomInt(1, 2);
      if (side === 1) sets[adjustSet].side1Score += 1;
      else sets[adjustSet].side2Score += 1;
      matchUpWinningSide = side;
    } else {
      matchUpWinningSide = side1Total > side2Total ? 1 : 2;
    }
  } else {
    const analysis = analyzeMatchUp({ matchUp: { score: { sets }, matchUpFormat, winningSide } });
    matchUpWinningSide = analysis.calculatedWinningSide;
  }

  // add the side perspective stringScores
  const { score } = matchUpScore({
    winningSide: matchUpWinningSide,
    score: { sets },
    matchUpStatus,
  });

  const outcome = {
    winningSide: matchUpWinningSide,
    matchUpStatus,
    score,
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
function generateSet({ weightedRange = [0, 1], pointsPerMinute, matchUpStatus, incomplete, setFormat, setNumber }) {
  const set: any = { setNumber };
  const { setTo, tiebreakFormat, tiebreakAt, tiebreakSet, timed, minutes } = setFormat;

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
    let highSide = (scores[0] > scores[1] && 1) || (scores[1] > scores[0] && 2) || 0;

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
    const range = generateRange(1, setTo + 1).flatMap((value) => generateRange(0, setTo + 2 - value).map(() => value));
    const lowValue = range[randomInt(0, range.length - 1)];

    const scores =
      setTo &&
      getSetComplement({
        isSide1: true,
        tiebreakAt,
        lowValue,
        setTo,
      });
    const isTiebreakSet = !scores;
    const specifiedWinningSide = weightedRange.length === 1 && weightedRange[weightIndex] + 1;

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
      matchUpScoringFormat: { setFormat },
      setObject: set,
    });

    let tiebreakWinningSide;
    if (setAnalysis.hasTiebreakCondition || isTiebreakSet) {
      const { NoAD: tiebreakNoAd, tiebreakTo } = tiebreakFormat || tiebreakSet || {};
      const range = generateRange(1, tiebreakTo + 1).flatMap((value) =>
        generateRange(0, tiebreakTo + 2 - value).map(() => value),
      );
      const lowValue = range[randomInt(0, range.length - 1)];
      const scores = getTiebreakComplement({
        isSide1: true,
        tiebreakNoAd,
        tiebreakTo,
        lowValue,
      });

      if (scores) {
        if (isTiebreakSet) {
          const highSide = scores[0] > scores[1] ? 1 : 2; // sides are not tied
          if (specifiedWinningSide) {
            if (highSide !== specifiedWinningSide) scores.reverse();
          } else if (reverseScores) {
            scores.reverse();
          }
          [set.side1TiebreakScore, set.side2TiebreakScore] = scores;
          tiebreakWinningSide = (scores[0] > scores[1] && 1) || (scores[1] > scores[0] && 2) || undefined;
        } else if (setAnalysis.leadingSide === 2) {
          [set.side1TiebreakScore, set.side2TiebreakScore] = scores;
        } else {
          [set.side2TiebreakScore, set.side1TiebreakScore] = scores;
        }
      }
    }

    set.winningSide = setAnalysis.winningSide || setAnalysis.leadingSide || specifiedWinningSide || tiebreakWinningSide;
  }
  return { set };
}
