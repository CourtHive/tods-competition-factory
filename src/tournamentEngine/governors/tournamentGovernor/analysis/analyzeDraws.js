import { structureActiveDrawPositions } from '../../../../drawEngine/getters/structureActiveDrawPositions';
import { getRoundMatchUps } from '../../../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { getPositionAssignments } from '../../../../drawEngine/getters/positionsGetter';
import { stageOrder } from '../../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../../constants/resultConstants';

export function analyzeDraws(tournamentRecord) {
  const drawsAnalysis = {
    noPositionsAssigned: 0, // no positions assigned
    positionsNoOutcomes: 0, // all positions assigned and no outcomes
    matchPlayDraws: 0, // only first round has active matchUps; some unassigned positions
    canBePruned: 0, // partially assigned positions with outcomes => drawSizes can be reduced
    draws: [],
  };

  const drawDefinitions = tournamentRecord.events
    ?.map((event) => event?.drawDefinitions)
    .flat()
    .filter(Boolean);

  drawDefinitions.forEach((drawDefinition) => {
    const structures = drawDefinition?.structures || [];
    const structureData = structures.map((structure) => {
      const { stage, stageSequence, structureId } = structure;
      const orderNumber = stageOrder[stage];
      const { inContextStructureMatchUps } = structureActiveDrawPositions({
        drawDefinition,
        structure,
      });
      const { positionAssignments } = getPositionAssignments({ structure });
      const positionsAssigned = positionAssignments?.filter(
        ({ participantId }) => participantId
      );
      const unassignedPositionsCount =
        (positionAssignments?.length || 0) - (positionsAssigned?.length || 0);

      const { roundMatchUps, roundProfile, roundNumbers, maxMatchUpsCount } =
        getRoundMatchUps({ matchUps: inContextStructureMatchUps });

      const activeRounds = Object.keys(roundProfile).filter(
        (roundNumber) => !roundProfile[roundNumber].inactiveRound
      );
      const inactiveStructure = Object.values(roundProfile).every(
        (profile) => profile.inactiveRound
      );

      return {
        positionsAssignedCount: positionsAssigned?.length || 0,
        unassignedPositionsCount,
        inactiveStructure,
        maxMatchUpsCount,
        roundMatchUps,
        activeRounds,
        roundNumbers,
        roundProfile,
        structureId,

        stageSequence,
        orderNumber,
        stage,
      };
    });

    const mainStructure = structureData.find(
      (data) => data.orderNumber === 2 && data.stageSequence === 1
    );
    const isMatchPlay =
      mainStructure.activeRounds.length === 1 &&
      parseInt(mainStructure.activeRounds[0]) === 1;

    const canBePruned =
      mainStructure.activeRounds.length &&
      mainStructure.roundProfile[1].inActiveCount;

    if (isMatchPlay) drawsAnalysis.matchPlayDraws += 1;
    if (canBePruned) drawsAnalysis.canBePruned += 1;

    drawsAnalysis.draws.push({
      drawId: drawDefinition.drawId,
      structureData,
      isMatchPlay,
    });
  });

  return { ...SUCCESS, drawsAnalysis };
}
