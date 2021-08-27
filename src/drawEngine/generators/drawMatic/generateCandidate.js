export function generateCandidate({
  rankedMatchUps,
  matchUpValues,
  deltaObjects,
  candidateGoal = 2000,
  actorDivisor = 100,
}) {
  let rankedMatchUpValues = Object.assign(
    {},
    ...rankedMatchUps.map((rm) => ({ [rm.matchUp]: rm.value }))
  );

  let candidate = roundCandidate({
    rankedMatchUps,
    rankedMatchUpValues,
    deltaObjects,
  });
  let deltaCandidate = candidate;

  // for each actor generate a roundCandidate using all of their matchUp values
  let actors = Object.keys(matchUpValues);
  let divisor = candidateGoal / (actors.length / actorDivisor);
  let iterations = Math.floor(divisor / actors.length);
  if (iterations > candidateGoal) iterations = candidateGoal;

  actors.forEach((actor) => {
    let matchUps = matchUpValues[actor];
    matchUps.slice(0, iterations).forEach((m) => {
      let proposed = roundCandidate({
        rankedMatchUps,
        rankedMatchUpValues,
        stipulated: [m.opponents],
        deltaObjects,
      });
      if (proposed.maxDelta < deltaCandidate.maxDelta)
        deltaCandidate = proposed;
      if (proposed.value < candidate.value) candidate = proposed;
    });
  });

  return candidate;
}

function roundCandidate({
  rankedMatchUps,
  rankedMatchUpValues,
  stipulated = [],
  deltaObjects,
}) {
  let candidateValue = 0;
  let matchUps = [];
  let roundPlayers = [].concat(...stipulated);
  stipulated.forEach((opponents) => {
    let matchUp = matchupHash(...opponents);
    let value = rankedMatchUpValues[matchUp];
    matchUps.push({ opponents, value });
    candidateValue += rankedMatchUpValues[matchUp];
  });
  rankedMatchUps.forEach((rm) => {
    let opponents = rm.matchUp.split('|');
    let opponent_exists = opponents.reduce(
      (p, c) => roundPlayers.indexOf(c) >= 0 || p,
      false
    );
    if (!opponent_exists) {
      roundPlayers = roundPlayers.concat(...opponents);
      let value = rm.value;
      candidateValue += value;
      matchUps.push({ opponents, value });
    }
  });
  matchUps.sort((a, b) => a.value - b.value);
  let maxDelta = matchUps.reduce((p, c) => {
    let mu = c.opponents.sort().join('|');
    let delta = deltaObjects[mu];
    return delta > p ? delta : p;
  }, 0);

  return { value: candidateValue, matchUps, maxDelta };
}

function matchupHash(id1, id2) {
  return [id1, id2].sort().join('|');
}
