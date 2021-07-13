/*
  returns the next round matchUp for winner of given matchUp
*/
export function nextRoundMatchUp({ structureMatchUps, matchUp }) {
  const { roundNumber, roundPosition } = matchUp;
  const currentRoundMatchUps = structureMatchUps.filter(
    (matchUp) => matchUp.roundNumber === roundNumber
  );
  const nextRoundMatchUps = structureMatchUps.filter(
    (matchUp) => matchUp.roundNumber === roundNumber + 1
  );

  if (nextRoundMatchUps.length) {
    let nextMatchUp;
    if (nextRoundMatchUps.length === currentRoundMatchUps.length) {
      nextMatchUp = nextRoundMatchUps.find(
        (matchUp) => matchUp.roundPosition === roundPosition
      );
    } else if (nextRoundMatchUps.length === currentRoundMatchUps.length / 2) {
      nextMatchUp = nextRoundMatchUps.find(
        (matchUp) => matchUp.roundPosition === Math.ceil(roundPosition / 2)
      );
    }

    return { matchUp: nextMatchUp };
  }
  return { error: 'no progression found' };
}
