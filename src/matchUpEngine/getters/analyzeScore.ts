import { parse } from '../governors/matchUpFormatGovernor/parse';
import { instanceCount } from '../../utilities';

import {
  DEFAULTED,
  RETIRED,
  WALKOVER,
} from '../../constants/matchUpStatusConstants';

export function analyzeScore({
  existingMatchUpStatus,
  matchUpFormat,
  matchUpStatus,
  winningSide,
  score,
}) {
  const sets = score?.sets || [];
  const completedSets = sets?.filter((set) => set?.winningSide) || [];
  const setsWinCounts = completedSets.reduce(
    (counts, set) => {
      const { winningSide } = set;
      const winningSideIndex = winningSide - 1;
      counts[winningSideIndex]++;
      return counts;
    },
    [0, 0]
  );
  const matchUpWinningSideIndex = winningSide && winningSide - 1;
  const matchUpLosingSideIndex = 1 - matchUpWinningSideIndex;
  const winningSideSetsCount = setsWinCounts[matchUpWinningSideIndex];
  const losingSideSetsCount = setsWinCounts[matchUpLosingSideIndex];

  const matchUpScoringFormat = parse(matchUpFormat);
  const maxSetsCount = Math.max(...setsWinCounts);
  const maxSetsInstances = instanceCount(setsWinCounts)[maxSetsCount];

  const { bestOf } = matchUpScoringFormat || {};
  const setsToWin = (bestOf && Math.ceil(bestOf / 2)) || 1;

  const relevantMatchUpStatus = matchUpStatus || existingMatchUpStatus;
  const irregularEnding = [DEFAULTED, RETIRED, WALKOVER].includes(
    relevantMatchUpStatus
  );

  const validSets =
    !matchUpScoringFormat ||
    !sets.length ||
    sets.every((set, i) => {
      const setNumber = i + 1;
      const isFinalSet = setNumber === bestOf;
      const isLastSet = setNumber === sets.length;

      const {
        side1Score,
        side2Score,
        side1TiebreakScore,
        side2TiebreakScore,
        winningSide: setWinningSide,
      } = set;
      const maxSetScore = Math.max(side1Score || 0, side2Score || 0);
      const hasTiebreak = side1TiebreakScore || side2TiebreakScore;

      const { finalSetFormat, setFormat } = matchUpScoringFormat;
      const setValues = isFinalSet ? finalSetFormat || setFormat : setFormat;

      if (hasTiebreak) {
        const { tiebreakTo, NoAD } = setValues?.tiebreakFormat || {};
        const maxTiebreakScore = Math.max(
          side1TiebreakScore || 0,
          side2TiebreakScore || 0
        );
        if (NoAD && maxTiebreakScore > tiebreakTo) return false;
        if (maxTiebreakScore < tiebreakTo && setWinningSide) {
          if (isLastSet && !irregularEnding) return false;
          if (!isLastSet) return false;
        }
      }

      if (!setValues.setTo) return true;

      const excessiveSetScore =
        !setValues.noTiebreak && maxSetScore > setValues.setTo + 1;
      return excessiveSetScore ? false : true;
    });

  const calculatedWinningSide =
    ((!matchUpFormat || maxSetsCount === setsToWin) &&
      maxSetsInstances === 1 &&
      setsWinCounts.indexOf(maxSetsCount) + 1) ||
    undefined;

  const valid =
    validSets &&
    ((winningSide &&
      winningSideSetsCount > losingSideSetsCount &&
      winningSide === calculatedWinningSide) ||
      (!winningSide && !calculatedWinningSide) ||
      irregularEnding);

  return { valid };
}
