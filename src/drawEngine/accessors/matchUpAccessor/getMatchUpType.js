import { TEAM, INDIVIDUAL, PAIR } from 'competitionFactory/constants/participantTypes';
import { SINGLES, DOUBLES } from 'competitionFactory/constants/matchUpTypes';

export function getMatchUpType({matchUp}) {
  if (matchUp.matchUpType) return matchUp.matchUpType;
  if (matchUp.Sides && matchUp.Sides.filter(f=>f).length) {
    const side1 = matchUp.Sides[0];
    const participant = side1 && side1.participant;
    const participantType = participant && participant.participantType;
    if (participantType === INDIVIDUAL) { return SINGLES; }
    if (participantType === PAIR) return DOUBLES;
    if (participantType === TEAM) return TEAM;
  }
}