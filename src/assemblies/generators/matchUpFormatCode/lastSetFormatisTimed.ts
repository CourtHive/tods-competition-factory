import { parse } from '../..//generators/matchUpFormatCode/parse';
import { MatchUp } from '../../../types/tournamentTypes';

type MatchUpArg = {
  [key: string | number | symbol]: unknown;
} & MatchUp;

export function lastSetFormatIsTimed(inContextMatchUp: MatchUpArg): boolean {
  const { matchUpFormat, score } = inContextMatchUp;
  const lastSetNumber = score?.sets?.length;
  const matchUpScoringFormat: any = matchUpFormat && parse(matchUpFormat);
  const { setFormat, finalSetFormat, bestOf } = matchUpScoringFormat ?? {};
  const isLastSet = bestOf && lastSetNumber === bestOf;
  const lastSetFormat = isLastSet ? finalSetFormat || setFormat : setFormat;
  return lastSetFormat?.timed || false;
}
