import { parse } from '../matchUpFormatGovernor/parse';
import { instanceCount } from '../../../utilities';

import {
  DEFAULTED,
  RETIRED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function analyzeScore({
  existingMatchUpStatus,
  matchUpFormat,
  matchUpStatus,
  winningSide,
  score,
}) {
  const sets = score?.sets;
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

  const calculatedWinningSide =
    ((!matchUpFormat || maxSetsCount === setsToWin) &&
      maxSetsInstances === 1 &&
      setsWinCounts.indexOf(maxSetsCount) + 1) ||
    undefined;

  const validMatchUpWinningSide =
    (winningSide &&
      winningSideSetsCount > losingSideSetsCount &&
      winningSide === calculatedWinningSide) ||
    (!winningSide && !calculatedWinningSide) ||
    irregularEnding;

  return validMatchUpWinningSide;
}
