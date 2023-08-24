import { HydratedMatchUp } from '../../types/hydrated';
import { numericSort } from '../../utilities';

type GetInitialRoundNumberArgs = {
  matchUps?: HydratedMatchUp[];
  drawPosition: number;
};
export function getInitialRoundNumber({
  drawPosition,
  matchUps = [],
}: GetInitialRoundNumberArgs) {
  // determine the initial round where drawPosition appears
  // drawPosition cannot be removed from its initial round
  const initialRoundNumber = matchUps
    .filter(
      ({ drawPositions }) =>
        drawPosition && drawPositions?.includes(drawPosition)
    )
    .map(({ roundNumber }) => roundNumber)
    .sort(numericSort)[0];
  return { initialRoundNumber };
}
