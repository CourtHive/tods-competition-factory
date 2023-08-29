import { getParticipantIdMatchUps } from './participantIdMatchUps';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { BYE, COMPLETED } from '../../../constants/matchUpStatusConstants';
import { HydratedParticipant } from '../../../types/hydrated';
import { DrawDefinition } from '../../../types/tournamentFromSchema';

type GetParticipantIdFinishingPositionsArgs = {
  tournamentParticipants: HydratedParticipant[];
  drawDefinition: DrawDefinition;
  byeAdvancements?: boolean;
};
export function getParticipantIdFinishingPositions({
  byeAdvancements = false,
  tournamentParticipants,
  drawDefinition,
}: GetParticipantIdFinishingPositionsArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { participantIds, participantIdMatchUps } = getParticipantIdMatchUps({
    tournamentParticipants,
    drawDefinition,
  });

  const participantIdFinishingPositions = participantIds.map(
    (participantId) => {
      const matchUps = participantIdMatchUps[participantId];
      const relevantMatchUps = matchUps.filter(
        (matchUp) =>
          [COMPLETED, BYE].includes(matchUp.matchUpStatus) ||
          matchUp.winningSide
      );
      const finishingPositionRanges = relevantMatchUps.map((matchUp) => {
        const isByeMatchUp = matchUp.sides.find((side) => side.bye);
        const participantSide = matchUp.sides.find(
          (side) => side.participantId === participantId
        ).sideNumber;

        const advancingSide =
          matchUp.winningSide ||
          (byeAdvancements && isByeMatchUp && participantSide);

        return advancingSide === participantSide
          ? matchUp.finishingPositionRange.winner
          : matchUp.finishingPositionRange.loser;
      });

      const diff = (range) => Math.abs(range[0] - range[1]);
      const finishingPositionRange = finishingPositionRanges.reduce(
        (finishingPositionRange, range) => {
          if (!finishingPositionRange) return range;
          return diff(finishingPositionRange) < diff(range)
            ? finishingPositionRange
            : range;
        },
        undefined
      );

      return {
        [participantId]: {
          relevantMatchUps,
          finishingPositionRanges,
          finishingPositionRange,
        },
      };
    }
  );

  return Object.assign({}, ...participantIdFinishingPositions);
}
