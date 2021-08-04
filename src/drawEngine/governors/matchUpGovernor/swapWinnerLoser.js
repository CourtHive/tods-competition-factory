import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { addNotice, getDevContext } from '../../../global/globalState';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';

/**
 * for FMLC 2nd round matchUps test whether it if a first loss for both participants
 */
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

  if (getDevContext({ changeWinner: true }))
    console.log({ existingWinnerSubsequentMatchUps });

  // replace new winningSide drawPosition in all subsequent matches in structure
  existingWinnerSubsequentMatchUps.forEach((matchUp) => {
    matchUp.drawPositions = matchUp.drawPositions.map((drawPosition) =>
      drawPosition === existingWinnerDrawPosition
        ? existingLoserDrawPosition
        : drawPosition
    );
    addNotice({
      topic: MODIFY_MATCHUP,
      payload: { matchUp },
      key: matchUp.matchUpId,
    });
  });

  const { stage: currentStage, stageSequence: currentStageSequence } =
    structure;
  const subsequentStructureIds = drawDefinition.structures
    .filter(
      ({ stage, stageSequence }) =>
        stage === currentStage && stageSequence > currentStageSequence
    )
    .map(({ structureId }) => structureId);

  const {
    targetLinks: { loserTargetLink, winnerTargetLink },
  } = params.targetData;
  const targetStructureIds = [
    loserTargetLink?.target.structureId,
    winnerTargetLink?.target?.structureId,
  ].filter(Boolean);

  // find target structures that are not part of current stage...
  // ... as well as any subsequent structures
  drawDefinition.structures
    .filter(({ stage, structureId }) => {
      return stage !== currentStage && targetStructureIds.includes(structureId);
    })
    .forEach(
      ({
        stage: targetStage,
        stageSequence: targetStageSequence,
        structureId,
      }) => {
        if (!subsequentStructureIds.includes(structureId))
          subsequentStructureIds.push(structureId);

        drawDefinition.structures
          .filter(
            ({ stage, stageSequence }) =>
              stage === targetStage && stageSequence > targetStageSequence
          )
          .forEach(({ structureId }) => {
            if (!subsequentStructureIds.includes(structureId))
              subsequentStructureIds.push(structureId);
          });
      }
    );

  const subsequentStructures = drawDefinition.structures.filter(
    ({ structureId }) => subsequentStructureIds.includes(structureId)
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
