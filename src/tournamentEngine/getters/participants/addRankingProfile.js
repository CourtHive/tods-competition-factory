import { QUALIFYING } from '../../../constants/drawDefinitionConstants';

export function addRankingProfile({
  participantMatchUps,
  participantDraws,
  matchUps,
}) {
  participantDraws?.forEach((draw) => {
    const drawMatchUps =
      (matchUps &&
        participantMatchUps.filter(
          (matchUp) => matchUp.drawId === draw.drawId
        )) ||
      [];
    const diff = (range) => Math.abs(range[0] - range[1]);

    const exits = {};
    const finishingPositionRange = drawMatchUps.reduce(
      (finishingPositionRange, matchUp) => {
        const { stage, finishingRound } = matchUp;
        if (!exits[stage]) exits[stage] = {};
        if (matchUp.finishingPositionRange) {
          if (
            !exits[stage].finishingPositionRange ||
            diff(matchUp.finishingPositionRange) <
              diff(exits[stage].finishingPositionRange)
          ) {
            exits[stage].finishingPositionRange =
              matchUp.finishingPositionRange;
          }
        }
        if (finishingRound) {
          if (
            !exits[stage].finishingRound ||
            finishingRound < exits[stage].finishingRound
          ) {
            exits[stage].finishingRound = finishingRound;
          }
        }

        if (!finishingPositionRange) return matchUp.finishingPositionRange;
        if (matchUp.stage === QUALIFYING) finishingPositionRange;

        return finishingPositionRange &&
          matchUp.finishingPositionRange &&
          diff(finishingPositionRange) > diff(matchUp.finishingPositionRange)
          ? matchUp.finishingPositionRange
          : finishingPositionRange;
      },
      undefined
    );
    draw.finishingPositionRange = finishingPositionRange;
    draw.exits = exits;
  });
}
