import { getParticipantIdMatchUps } from './participantIdMatchUps';

import { MISSING_DRAW_DEFINITION } from '@Constants/errorConditionConstants';
import { BYE, COMPLETED } from '@Constants/matchUpStatusConstants';
import { DrawDefinition, Tournament } from '@Types/tournamentTypes';

type GetParticipantIdFinishingPositionsArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  byeAdvancements?: boolean;
};
export function getParticipantIdFinishingPositions({
  byeAdvancements = false,
  tournamentRecord,
  drawDefinition,
}: GetParticipantIdFinishingPositionsArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { participantIds, participantIdMatchUps } = getParticipantIdMatchUps({
    tournamentParticipants: tournamentRecord?.participants,
    drawDefinition,
  });

  const participantIdFinishingPositions =
    participantIds?.map((participantId) => {
      const matchUps = participantIdMatchUps[participantId];
      const relevantMatchUps = matchUps.filter(
        (matchUp) => [COMPLETED, BYE].includes(matchUp.matchUpStatus) || matchUp.winningSide,
      );
      const finishingPositionRanges = relevantMatchUps.map((matchUp) => {
        const isByeMatchUp = matchUp.sides.find((side) => side.bye);
        const participantSide = matchUp.sides.find((side) => side.participantId === participantId).sideNumber;

        const advancingSide = matchUp.winningSide || (byeAdvancements && isByeMatchUp && participantSide);

        return advancingSide === participantSide
          ? matchUp.finishingPositionRange.winner
          : matchUp.finishingPositionRange.loser;
      });

      const diff = (range) => Math.abs(range[0] - range[1]);
      const finishingPositionRange = finishingPositionRanges.reduce((finishingPositionRange, range) => {
        if (!finishingPositionRange) return range;
        return diff(finishingPositionRange) < diff(range) ? finishingPositionRange : range;
      }, undefined);

      return {
        [participantId]: {
          relevantMatchUps,
          finishingPositionRanges,
          finishingPositionRange,
        },
      };
    }) || [];

  return Object.assign({}, ...participantIdFinishingPositions);
}
