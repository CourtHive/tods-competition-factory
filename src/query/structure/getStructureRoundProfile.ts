import { decorateResult } from '../../global/functions/decorateResult';
import { getAllStructureMatchUps } from '../matchUps/getAllStructureMatchUps';
import { DrawDefinition, MatchUp } from '../../types/tournamentTypes';
import { findStructure } from '../../acquire/findStructure';

import { MatchUpsMap } from '../matchUps/getMatchUpsMap';
import { RoundMatchUpsResult, getRoundMatchUps } from '../matchUps/getRoundMatchUps';

type GetStructureRoundProfileArgs = {
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  structureId: string;
};

export function getStructureRoundProfile({
  drawDefinition,
  matchUpsMap,
  structureId,
}: GetStructureRoundProfileArgs): RoundMatchUpsResult & {
  matchUps?: MatchUp[];
  matchUpsMap?: any;
} {
  const result = findStructure({
    drawDefinition,
    structureId,
  });
  if (result.error) return decorateResult({ result });

  // DEV-NOTE cannot pass drawDefinition parameter in this scenario; callstack error
  const { matchUps } = getAllStructureMatchUps({
    structure: result.structure,
    matchUpsMap,
  });

  return { ...getRoundMatchUps({ matchUps }), matchUps, matchUpsMap };
}
