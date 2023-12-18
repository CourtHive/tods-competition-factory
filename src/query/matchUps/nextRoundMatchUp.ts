/*
  returns the next round matchUp for winner of given matchUp
  must exclude tieMatchUps as next round matchUp count may not be consistent
*/
export function nextRoundMatchUp({ structureMatchUps, matchUp }) {
  const { roundNumber, roundPosition } = matchUp;
  const currentRoundMatchUps = structureMatchUps.filter(
    (matchUp) => matchUp.roundNumber === roundNumber && !matchUp.matchUpTieId
  );
  const nextRoundMatchUps = structureMatchUps.filter(
    (matchUp) =>
      matchUp.roundNumber === roundNumber + 1 && !matchUp.matchUpTieId
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
  return { message: 'no progression found' };
}
