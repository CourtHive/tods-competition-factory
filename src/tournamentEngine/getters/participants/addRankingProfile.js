import { definedAttributes } from '../../../utilities';

import { DEFAULTED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { QUALIFYING } from '../../../constants/drawDefinitionConstants';

export function addRankingProfile({
  participantMatchUps,
  participantDraws,
  derivedDrawInfo,
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

    const structureParticipation = {};
    const finishingPositionRange = drawMatchUps.reduce(
      (finishingPositionRange, matchUp) => {
        const {
          participantWon,
          finishingRound,
          matchUpStatus,
          roundNumber,
          structureId,
          stage,
        } = matchUp;

        if (!structureParticipation[structureId]) {
          structureParticipation[structureId] = {
            walkoverWinCount: 0,
            defaultWinCount: 0,
            winCount: 0,
          };
        }

        structureParticipation[structureId].rankingStage = stage;
        if (participantWon) {
          structureParticipation[structureId].winCount =
            structureParticipation[structureId].winCount + 1;
          if (matchUpStatus === WALKOVER) {
            structureParticipation[structureId].walkoverWinCount =
              structureParticipation[structureId].walkoverWinCount + 1;
          }
          if (matchUpStatus === DEFAULTED) {
            structureParticipation[structureId].defaultWinCount =
              structureParticipation[structureId].defaultWinCount + 1;
          }
        }

        if (matchUp.finishingPositionRange) {
          if (
            !structureParticipation[structureId].finishingPositionRange ||
            diff(matchUp.finishingPositionRange) <
              diff(structureParticipation[structureId].finishingPositionRange)
          ) {
            structureParticipation[structureId].finishingPositionRange =
              matchUp.finishingPositionRange;
          }
        }

        if (finishingRound) {
          if (
            !structureParticipation[structureId].finishingRound ||
            finishingRound < structureParticipation[structureId].finishingRound
          ) {
            structureParticipation[structureId].participantWon = participantWon;
            structureParticipation[structureId].finishingRound = finishingRound;
            structureParticipation[structureId].roundNumber = roundNumber;
          }
        }

        if (!finishingPositionRange) return matchUp.finishingPositionRange;

        // finishingPositionRange in QUALIFYING is not relevant to ranking pipelines
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

    const { orderedStructureIds, flightNumber } = derivedDrawInfo[draw.drawId];
    const orderedStructureExits = Object.keys(structureParticipation).sort(
      (a, b) =>
        orderedStructureIds?.indexOf(a) ||
        0 - orderedStructureIds?.indexOf(b) ||
        0
    );

    let nonQualifyingOrder = 0;
    // structures in which a participant participants/exits
    draw.structureParticipation = orderedStructureExits.map((x) => {
      const notQualifying = structureParticipation[x].stage !== QUALIFYING;
      if (notQualifying) nonQualifyingOrder += 1;
      const participationOrder = notQualifying ? nonQualifyingOrder : undefined;
      return definedAttributes({
        ...structureParticipation[x],
        participationOrder,
        flightNumber,
      });
    });
  });
}
