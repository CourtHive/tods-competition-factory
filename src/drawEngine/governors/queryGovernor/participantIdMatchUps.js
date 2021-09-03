import { makeDeepCopy, unique } from '../../../utilities';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

export function getParticipantIdMatchUps({
  tournamentParticipants,
  drawDefinition,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const result = getAllDrawMatchUps({
    tournamentParticipants,
    drawDefinition,
    inContext: true,
    event,
  });

  const allMatchUps = makeDeepCopy(result.matchUps);

  const participantIds = unique(
    allMatchUps.reduce((participantIds, matchUp) => {
      return participantIds.concat(
        ...matchUp.sides.map((side) => side.participantId).filter(Boolean)
      );
    }, [])
  );

  const participantIdMatchUps = Object.assign(
    {},
    ...participantIds.map((participantId) => {
      const matchUps = allMatchUps.filter((matchUp) => {
        const participantIds = matchUp.sides
          .map((side) => side.participantId)
          .filter(Boolean);
        return participantIds.includes(participantId);
      });
      return { [participantId]: matchUps };
    })
  );

  return { participantIds, participantIdMatchUps };
}
