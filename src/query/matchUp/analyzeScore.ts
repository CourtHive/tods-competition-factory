import { parse } from '@Helpers/matchUpFormatCode/parse';
import { instanceCount } from '@Tools/arrays';

// constants and types
import { COMPLETED, DEFAULTED, RETIRED, WALKOVER } from '@Constants/matchUpStatusConstants';
import { Score } from '@Types/tournamentTypes';

type AnalyzeScoreArgs = {
  existingMatchUpStatus?: string;
  matchUpStatus?: string;
  matchUpFormat?: string;
  winningSide?: number;
  score: Score;
};
export function analyzeScore({
  existingMatchUpStatus,
  matchUpFormat,
  matchUpStatus,
  winningSide,
  score,
}: AnalyzeScoreArgs) {
  const sets = score?.sets ?? [];
  const completedSets = sets?.filter((set) => set?.winningSide) || [];
  const setsWinCounts = completedSets.reduce(
    (counts, set) => {
      const { winningSide } = set;
      if (!winningSide) return counts;
      const winningSideIndex = winningSide - 1;
      counts[winningSideIndex]++;
      return counts;
    },
    [0, 0],
  );
  const matchUpWinningSideIndex = winningSide ? winningSide - 1 : undefined;
  const matchUpLosingSideIndex =
    matchUpWinningSideIndex !== undefined && [0, 1].includes(matchUpWinningSideIndex)
      ? 1 - matchUpWinningSideIndex
      : undefined;
  const winningSideSetsCount = matchUpWinningSideIndex !== undefined && setsWinCounts[matchUpWinningSideIndex];
  const losingSideSetsCount = matchUpLosingSideIndex !== undefined && setsWinCounts[matchUpLosingSideIndex];

  const matchUpScoringFormat = matchUpFormat ? parse(matchUpFormat) : undefined;
  const maxSetsCount = Math.max(...setsWinCounts);
  const maxSetsInstances = instanceCount(setsWinCounts)[maxSetsCount];
  const timed = matchUpScoringFormat?.setFormat?.timed || matchUpScoringFormat?.finalSetFormat?.timed;

  const bestOf = matchUpScoringFormat?.bestOf;
  const setsToWin = (bestOf && Math.ceil(bestOf / 2)) || 1;

  const relevantMatchUpStatus = matchUpStatus ?? existingMatchUpStatus;
  const irregularEnding = relevantMatchUpStatus && [DEFAULTED, RETIRED, WALKOVER].includes(relevantMatchUpStatus);

  const validSets =
    !matchUpScoringFormat ||
    !sets.length ||
    sets.every((set, i) => {
      const setNumber = i + 1;
      const isFinalSet = setNumber === bestOf;
      const isLastSet = setNumber === sets.length;

      const { side1Score, side2Score, side1TiebreakScore, side2TiebreakScore, winningSide: setWinningSide } = set;
      const maxSetScore = Math.max(side1Score ?? 0, side2Score ?? 0);
      const hasTiebreak = side1TiebreakScore ?? side2TiebreakScore;

      const { finalSetFormat, setFormat } = matchUpScoringFormat;
      const setValues = isFinalSet ? finalSetFormat || setFormat : setFormat;

      if (hasTiebreak) {
        const { tiebreakTo, NoAD } = setValues?.tiebreakFormat || {};
        const maxTiebreakScore = Math.max(side1TiebreakScore ?? 0, side2TiebreakScore ?? 0);
        if (NoAD && maxTiebreakScore > tiebreakTo) return false;
        if (maxTiebreakScore < tiebreakTo && setWinningSide) {
          if (isLastSet && !irregularEnding) return false;
          if (!isLastSet) return false;
        }
      }

      if (!setValues.setTo) return true;

      const excessiveSetScore = !setValues.noTiebreak && maxSetScore > setValues.setTo + 1;
      return !excessiveSetScore;
    });

  const calculatedWinningSide =
    ((!matchUpFormat || maxSetsCount === setsToWin) &&
      maxSetsInstances === 1 &&
      setsWinCounts.indexOf(maxSetsCount) + 1) ||
    undefined;

  const valid = !!(
    validSets &&
    ((winningSide && winningSideSetsCount > losingSideSetsCount && winningSide === calculatedWinningSide) ||
      (winningSide && irregularEnding) ||
      (!winningSide &&
        !calculatedWinningSide &&
        (![COMPLETED, DEFAULTED, RETIRED, WALKOVER].includes(relevantMatchUpStatus) ||
          (timed && relevantMatchUpStatus === COMPLETED))))
  );

  return { valid };
}
