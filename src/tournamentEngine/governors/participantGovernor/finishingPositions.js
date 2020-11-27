import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { BYE, COMPLETED } from '../../../constants/matchUpStatusConstants';

/**
 *
 * @param {string} drawId - drawId of target draw within a tournament
 * @param {boolean} byeAdvancements - whether or not to consider byeAdancements in returns finishingPositionRange
 *
 */
export function getParticipantIdFinishingPositions({
  tournamentRecord,
  drawDefinition,
  drawEngine,

  byeAdvancements = false,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const {
    participantIds,
    participantIdMatchUps,
  } = drawEngine.getParticipantIdMatchUps();

  const participantIdFinishingPositions = participantIds.map(participantId => {
    const matchUps = participantIdMatchUps[participantId];
    const relevantMatchUps = matchUps.filter(
      matchUp =>
        [COMPLETED, BYE].includes(matchUp.matchUpStatus) || matchUp.winningSide
    );
    const relevantFinishingPositionRanges = relevantMatchUps.map(matchUp => {
      const isByeMatchUp = matchUp.sides.find(side => side.bye);
      const participantSide = matchUp.sides.find(
        side => side.participantId === participantId
      ).sideNumber;

      const advancingSide =
        matchUp.winningSide ||
        (byeAdvancements && isByeMatchUp && participantSide);

      return advancingSide === participantSide
        ? matchUp.finishingPositionRange.winner
        : matchUp.finishingPositionRange.loser;
    });

    const diff = range => Math.abs(range[0] - range[1]);
    const finishingPositionRange = relevantFinishingPositionRanges.reduce(
      (finishingPositionRange, range) => {
        if (!finishingPositionRange) return range;
        return diff(finishingPositionRange) < diff(range)
          ? finishingPositionRange
          : range;
      },
      undefined
    );

    return { [participantId]: finishingPositionRange };
  });

  return Object.assign({}, ...participantIdFinishingPositions);
}
