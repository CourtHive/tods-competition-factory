import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';

import { DrawDefinition, Structure } from '../../../types/tournamentFromSchema';
import { LUCKY_DRAW } from '../../../constants/drawDefinitionConstants';
import { HydratedMatchUp } from '../../../types/hydrated';

type IsLuckyArgs = {
  roundMatchUps?: HydratedMatchUp[];
  isNotEliminationStructure?: boolean;
  drawDefinition?: DrawDefinition;
  structure?: Structure;
};
export function isLucky({
  isNotEliminationStructure,
  drawDefinition,
  roundMatchUps,
  structure,
}: IsLuckyArgs) {
  if (!structure) return false;

  if (!roundMatchUps) {
    ({ isNotEliminationStructure, roundMatchUps } = getRoundMatchUps({
      matchUps: structure.matchUps ?? [],
    }));
  }

  const hasFirstRoundDrawPositions = !!roundMatchUps?.[1]?.find(
    ({ drawPositions }) => drawPositions
  );

  const noSecondRoundDrawPositions = !roundMatchUps?.[2]?.find(
    ({ drawPositions }) => drawPositions
  );

  return (
    isNotEliminationStructure &&
    !structure?.structures &&
    hasFirstRoundDrawPositions &&
    noSecondRoundDrawPositions &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== LUCKY_DRAW)
  );
}
