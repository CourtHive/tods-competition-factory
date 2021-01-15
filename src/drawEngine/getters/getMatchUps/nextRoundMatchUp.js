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
      nextMatchUp = nextRoundMatchUps.reduce((matchUp, current) => {
        return current.roundPosition === roundPosition ? current : matchUp;
      }, undefined);
    } else if (nextRoundMatchUps.length === currentRoundMatchUps.length / 2) {
      nextMatchUp = nextRoundMatchUps.reduce((matchUp, current) => {
        return current.roundPosition === Math.ceil(roundPosition / 2)
          ? current
          : matchUp;
      }, undefined);
    }
    return { matchUp: nextMatchUp };
  }
  return { error: 'no progression found' };
}
