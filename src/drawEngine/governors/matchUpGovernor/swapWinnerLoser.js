import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { addNotice } from '../../../global/globalState';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';

export function swapWinnerLoser(params) {
  const { inContextMatchUp, structure, drawDefinition } = params;
  const matchUpRoundNumber = inContextMatchUp.roundNumber;

  const existingWinnerSide = inContextMatchUp.sides.find(
    (side) => side.sideNumber === inContextMatchUp.winningSide
  );
  const existingLoserSide = inContextMatchUp.sides.find(
    (side) => side.sideNumber !== inContextMatchUp.winningSide
  );

  const {
    drawPosition: existingWinnerDrawPosition,
    participantId: existingWinnerParticipantId,
  } = existingWinnerSide;
  const {
    drawPosition: existingLoserDrawPosition,
    participantId: existingLoserParticipantId,
  } = existingLoserSide;

  const { matchUps } = getAllStructureMatchUps(params);
  const existingWinnerSubsequentMatchUps = matchUps.filter(
    ({ drawPositions, roundNumber }) =>
      drawPositions.includes(existingWinnerDrawPosition) &&
      roundNumber > matchUpRoundNumber
  );

  // replace new winningSide drawPosition in all subsequent matches in structure
  existingWinnerSubsequentMatchUps.forEach((matchUp) => {
    matchUp.drawPositions = matchUp.drawPositions.map((drawPosition) =>
      drawPosition === existingWinnerDrawPosition
        ? existingLoserDrawPosition
        : drawPosition
    );
    addNotice({ topic: MODIFY_MATCHUP, payload: { matchUp } });
  });

  const currentStageSequence = structure.stageSequence;
  const subsequentStructures = drawDefinition.structures.filter(
    ({ stageSequence }) => stageSequence > currentStageSequence
  );

  // for each subsequent structure swap drawPosition assignments (where applicable)
  subsequentStructures.forEach((structure) => {
    const { positionAssignments } = getPositionAssignments({ structure });
    const existingWinnerAssignment = positionAssignments.find(
      ({ participantId }) => participantId === existingWinnerParticipantId
    );
    const existingLoserAssignment = positionAssignments.find(
      ({ participantId }) => participantId === existingLoserParticipantId
    );

    if (existingWinnerAssignment)
      existingWinnerAssignment.participantId = existingLoserParticipantId;
    if (existingLoserAssignment)
      existingLoserAssignment.participantId = existingWinnerParticipantId;
  });

  // apply new winningSide and any score updates
  return modifyMatchUpScore(params);
}
