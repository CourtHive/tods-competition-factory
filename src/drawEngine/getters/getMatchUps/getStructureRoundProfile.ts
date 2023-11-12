import { decorateResult } from '../../../global/functions/decorateResult';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { DrawDefinition, MatchUp } from '../../../types/tournamentFromSchema';
import { findStructure } from '../findStructure';

import { MatchUpsMap } from './getMatchUpsMap';
import {
  RoundMatchUpsResult,
  getRoundMatchUps,
} from '../../accessors/matchUpAccessor/getRoundMatchUps';

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
