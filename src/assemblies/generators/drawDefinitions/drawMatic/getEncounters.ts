import { xa } from '../../../../utilities/objects';
import { pairingHash } from './generateCandidate';

export function getEncounters({ matchUps }) {
  const encounters: any = [];

  for (const matchUp of matchUps) {
    const participantIds = matchUp.sides.map(xa('participantId'));
    if (participantIds.length === 2) {
      const [p1, p2] = participantIds;
      const pairing = pairingHash(p1, p2);
      if (!encounters.includes(pairing)) encounters.push(pairing);
    }
  }

  return { encounters };
}
