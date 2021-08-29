export function generateCandidate({
  rankedPairings,
  pairingValues,
  deltaObjects,
  candidateGoal = 2000,
  actorDivisor = 100,
}) {
  const rankedMatchUpValues = Object.assign(
    {},
    ...rankedPairings.map((rm) => ({ [rm.matchUp]: rm.value }))
  );

  let candidate = roundCandidate({
    rankedPairings,
    rankedMatchUpValues,
    deltaObjects,
  });
  let deltaCandidate = candidate;

  // for each actor generate a roundCandidate using all of their matchUp values
  const actors = Object.keys(pairingValues);
  const divisor = candidateGoal / (actors.length / actorDivisor);
  let iterations = Math.floor(divisor / actors.length);
  if (iterations > candidateGoal) iterations = candidateGoal;

  actors.forEach((actor) => {
    const participantIdPairings = pairingValues[actor];
    participantIdPairings.slice(0, iterations).forEach((pairing) => {
      const proposed = roundCandidate({
        rankedPairings,
        rankedMatchUpValues,
        stipulated: [pairing.participantIds],
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
  rankedPairings,
  rankedMatchUpValues,
  stipulated = [],
  deltaObjects,
}) {
  let candidateValue = 0;
  let participantIdPairings = [];
  let roundPlayers = [].concat(...stipulated);
  stipulated.filter(Boolean).forEach((participantIds) => {
    const pairing = pairingHash(...participantIds);
    const value = rankedMatchUpValues[pairing];
    participantIdPairings.push({ participantIds, value });
    candidateValue += rankedMatchUpValues[pairing];
  });
  rankedPairings.forEach((rankedPairing) => {
    const participantIds = rankedPairing.pairing.split('|');
    const opponent_exists = participantIds.reduce(
      (p, c) => roundPlayers.indexOf(c) >= 0 || p,
      false
    );
    if (!opponent_exists) {
      roundPlayers = roundPlayers.concat(...participantIds);
      let value = rankedPairing.value;
      candidateValue += value;
      participantIdPairings.push({ participantIds, value });
    }
  });
  participantIdPairings.sort((a, b) => a.value - b.value);
  const maxDelta = participantIdPairings.reduce((p, c) => {
    const hash = pairingHash(...c.participantIds);
    const delta = deltaObjects[hash];
    return delta > p ? delta : p;
  }, 0);

  return { value: candidateValue, participantIdPairings, maxDelta };
}

function pairingHash(id1, id2) {
  return [id1, id2].sort().join('|');
}
