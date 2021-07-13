import { TEAM, INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { SINGLES, DOUBLES } from '../../../constants/matchUpTypes';

export function getMatchUpType({ matchUp = {} } = {}) {
  let matchUpType = matchUp.matchUpType;

  if (!matchUpType && matchUp.sides?.length) {
    const side = matchUp.sides.find(({ participant }) => participant);
    const participant = side?.participant;
    const participantType = participant?.participantType;
    matchUpType =
      participantType === INDIVIDUAL
        ? SINGLES
        : participantType === PAIR
        ? DOUBLES
        : participantType === TEAM
        ? TEAM
        : undefined;
  }

  return { matchUpType };
}
