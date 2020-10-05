import { TEAM, INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { SINGLES, DOUBLES } from '../../../constants/matchUpTypes';

export function getMatchUpType({ matchUp }) {
  if (matchUp.matchUpType) return matchUp.matchUpType;
  if (matchUp.sides && matchUp.sides.filter(f => f).length) {
    const side1 = matchUp.sides[0];
    const participant = side1 && side1.participant;
    const participantType = participant && participant.participantType;
    if (participantType === INDIVIDUAL) {
      return SINGLES;
    }
    if (participantType === PAIR) return DOUBLES;
    if (participantType === TEAM) return TEAM;
  }
}
