import { getRoundMatchUps } from '../matchUps/getRoundMatchUps';

// constants and types
import { DrawDefinition, Structure } from '@Types/tournamentTypes';
import { LUCKY_DRAW } from '@Constants/drawDefinitionConstants';
import { HydratedMatchUp } from '@Types/hydrated';

type IsLuckyArgs = {
  drawDefinition?: DrawDefinition;
  matchUps?: HydratedMatchUp[];
  roundsNotPowerOf2?: boolean;
  structure?: Structure;
};
export function isLucky({ roundsNotPowerOf2, drawDefinition, structure, matchUps }: IsLuckyArgs) {
  if (!structure) return false;

  matchUps = matchUps ?? structure.matchUps ?? [];
  roundsNotPowerOf2 = roundsNotPowerOf2 ?? getRoundMatchUps({ matchUps }).roundsNotPowerOf2;

  const hasDrawPositions =
    !!structure.positionAssignments?.find(({ drawPosition }) => drawPosition) ||
    !!matchUps?.find(({ drawPositions }) => drawPositions?.length);

  return (
    (!drawDefinition?.drawType || drawDefinition.drawType !== LUCKY_DRAW) &&
    !structure?.structures &&
    roundsNotPowerOf2 &&
    hasDrawPositions
  );
}
