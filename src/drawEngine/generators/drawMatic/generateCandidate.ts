export function generateCandidate({
  maxIterations = 5000, // cap the processing intensity of the candidate generator
  valueSortedPairings, // pairings sorted by value from low to high
  pairingValues,
  deltaObjects,
}) {
  const rankedMatchUpValues = Object.assign(
    {},
    ...valueSortedPairings.map((rm) => ({ [rm.pairing]: rm.value }))
  );

  // generate an initial candidate value with no stipulated pairings
  let candidate = roundCandidate({
    rankedMatchUpValues,
    valueSortedPairings,
    deltaObjects,
  });

  let deltaCandidate = candidate;

  const actors = Object.keys(pairingValues);

  // iterations is the number of loops over valueSortedPairings
  let candidatesCount = 0;
  let iterations;

  // calculate the number of opponents to consider for each participantId
  let opponentCount = actors.length;

  do {
    opponentCount -= 1;
    iterations =
      (actors.length * opponentCount * valueSortedPairings.length) / 2;
  } while (iterations > maxIterations && opponentCount > 2);

  const stipulatedPairs: string[] = [];

  // for each actor generate a roundCandidate using opponentCount of pairing values
  actors.forEach((actor) => {
    const participantIdPairings = pairingValues[actor];

    // opponentCount limits the number of opponents to consider
    participantIdPairings.slice(0, opponentCount).forEach((pairing) => {
      const stipulatedPair = pairingHash(actor, pairing.opponent);
      if (!stipulatedPairs.includes(stipulatedPair)) {
        const proposed = roundCandidate({
          // each roundCandidate starts with stipulated pairings
          stipulated: [[actor, pairing.opponent]],
          rankedMatchUpValues,
          valueSortedPairings,
          deltaObjects,
        });

        if (proposed.maxDelta < deltaCandidate.maxDelta)
          deltaCandidate = proposed;

        if (proposed.value < candidate.value) candidate = proposed;

        stipulatedPairs.push(stipulatedPair);
        candidatesCount += 1;
      }
    });
  });

  return { candidate, deltaCandidate, candidatesCount, iterations };
}

type RoundCandiateArgs = {
  rankedMatchUpValues: any;
  valueSortedPairings: any;
  stipulated?: any[];
  deltaObjects: any;
};
function roundCandidate({
  rankedMatchUpValues,
  valueSortedPairings,
  stipulated = [],
  deltaObjects,
}: RoundCandiateArgs) {
  // roundPlayers starts with the stipulated pairing
  const roundPlayers: any[] = [].concat(...stipulated);

  // aggregates the pairings generated for a roundCandidate
  const participantIdPairings: any[] = [];

  // candidateValue is the sum of all participantIdPairings in a roundCandidate
  // the winning candidate has the LOWEST total value
  let candidateValue = 0;

  // candidateValue is initialized with any stipulated pairings
  stipulated.filter(Boolean).forEach((participantIds) => {
    const [p1, p2] = participantIds;
    const pairing = pairingHash(p1, p2);
    const value = rankedMatchUpValues[pairing];
    participantIdPairings.push({ participantIds, value });
    candidateValue += rankedMatchUpValues[pairing];
  });

  // go through the valueSortedPairings (of all possible unique pairings)
  // this is an array sorted from lowest value to highest value
  valueSortedPairings.forEach((rankedPairing) => {
    const participantIds = rankedPairing.pairing.split('|');
    const opponentExists = participantIds.reduce(
      (p, c) => roundPlayers.includes(c) || p,
      false
    );

    if (!opponentExists) {
      roundPlayers.push(...participantIds);
      const value = rankedPairing.value;
      candidateValue += value;
      participantIdPairings.push({ participantIds, value });
    }
  });

  // sort the candidate's proposed pairings by value
  participantIdPairings.sort((a, b) => a.value - b.value);

  // determine the greatest delta in the candidate's pairings
  const maxDelta = participantIdPairings.reduce((p, c) => {
    const [p1, p2] = c.participantIds;
    const hash = pairingHash(p1, p2);
    const delta = deltaObjects[hash];
    return delta > p ? delta : p;
  }, 0);

  return { value: candidateValue, participantIdPairings, maxDelta };
}

export function pairingHash(id1, id2) {
  return [id1, id2].sort().join('|');
}
