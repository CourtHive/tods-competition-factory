import { numericSort } from '../../utilities';

export function getInitialRoundNumber({ drawPosition, matchUps = [] }) {
  // determine the initial round where drawPosition appears
  // drawPosition cannot be removed from its initial round
  const initialRoundNumber = matchUps
    .filter(
      ({ drawPositions }) =>
        drawPosition && drawPositions.includes(drawPosition)
    )
    .map(({ roundNumber }) => parseInt(roundNumber))
    .sort(numericSort)[0];
  return { initialRoundNumber };
}
