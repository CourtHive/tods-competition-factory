import { structureActiveDrawPositions } from '../../../../drawEngine/getters/structureActiveDrawPositions';
import { getRoundMatchUps } from '../../../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { getPositionAssignments } from '../../../../drawEngine/getters/positionsGetter';
import { getStructureLinks } from '../../../../drawEngine/getters/linkGetter';
import { stageOrder } from '../../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../../constants/resultConstants';

export function analyzeDraws({ tournamentRecord }) {
  const drawsAnalysis = {
    positionsNoOutcomes: [], // all positions assigned and no outcomes
    canBePruned: [], // partially assigned positions with outcomes => drawSizes can be reduced
    matchPlay: [], // only first round has active matchUps; some unassigned positions
    inactive: [],

    drawAnalysis: {},
  };

  const drawDefinitions = tournamentRecord.events
    ?.map((event) => event?.drawDefinitions)
    .flat()
    .filter(Boolean);

  drawDefinitions.forEach((drawDefinition) => {
    let positionsAssignedCount = 0;
    let matchUpsWithWinningSideCount = 0;
    const structures = drawDefinition?.structures || [];
    const structuresData = structures.map((structure) => {
      const { stage, stageSequence, structureId } = structure;
      const orderNumber = stageOrder[stage];
      const { inContextStructureMatchUps } = structureActiveDrawPositions({
        drawDefinition,
        structure,
      });
      const matchUpsWithWinningSide = inContextStructureMatchUps?.filter(
        ({ winningSide }) => winningSide
      );

      const winningSideCount =
        matchUpsWithWinningSide.filter(Boolean).length || 0;

      matchUpsWithWinningSideCount += winningSideCount;

      const maxWinningSideFirstRoundPosition = Math.max(
        matchUpsWithWinningSide
          .filter(({ roundNumber }) => roundNumber === 1)
          .map(({ roundPosition }) => roundPosition)
      );

      const { positionAssignments } = getPositionAssignments({ structure });
      const positionsAssigned = positionAssignments?.filter(
        ({ participantId }) => participantId
      );
      positionsAssignedCount += positionsAssigned.length;

      const unassignedPositionsCount =
        (positionAssignments?.length || 0) - (positionsAssigned?.length || 0);

      const { roundMatchUps, roundProfile, roundNumbers, maxMatchUpsCount } =
        getRoundMatchUps({ matchUps: inContextStructureMatchUps });

      const activeRounds = Object.keys(roundProfile)
        .filter((roundNumber) => !roundProfile[roundNumber].inactiveRound)
        .map((roundNumber) => parseInt(roundNumber));
      const inactiveRounds = Object.keys(roundProfile)
        .filter((roundNumber) => roundProfile[roundNumber].inactiveRound)
        .map((roundNumber) => parseInt(roundNumber));
      const inactiveStructure = Object.values(roundProfile).every(
        (profile) => profile.inactiveRound
      );

      return {
        positionsAssignedCount: positionsAssigned?.length || 0,
        maxWinningSideFirstRoundPosition,
        unassignedPositionsCount,
        inactiveStructure,
        maxMatchUpsCount,
        inactiveRounds,
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

    const mainStructure = structuresData.find(
      (data) => data.orderNumber === 2 && data.stageSequence === 1
    );

    const activeStructuresCount = structuresData.filter(
      ({ inactiveStructure }) => !inactiveStructure
    ).length;

    const { links } = getStructureLinks({
      drawDefinition,
      structureId: mainStructure.structureId,
    });

    const isMatchPlay =
      parseInt(mainStructure.activeRounds[0]) === 1 &&
      mainStructure.activeRounds.length === 1 &&
      activeStructuresCount === 1;

    const inactiveDraw = structuresData?.every(
      ({ inactiveStructure }) => inactiveStructure
    );

    const canBePruned =
      !links.length &&
      mainStructure.activeRounds.length &&
      (mainStructure.roundProfile[1].inactiveCount ||
        mainStructure.inactiveRounds.length);

    const drawId = drawDefinition.drawId;

    if (positionsAssignedCount && !matchUpsWithWinningSideCount)
      drawsAnalysis.positionsNoOutcomes.push(drawId);
    if (inactiveDraw) drawsAnalysis.inactive.push(drawId);
    if (isMatchPlay) drawsAnalysis.matchPlay.push(drawId);
    if (canBePruned) drawsAnalysis.canBePruned.push(drawId);

    const drawAnalysis = {
      matchUpsWithWinningSideCount,
      positionsAssignedCount,
      structuresData,
      inactiveDraw,
      isMatchPlay,
      drawId,
    };

    drawsAnalysis.drawAnalysis[drawId] = drawAnalysis;
  });

  return { ...SUCCESS, drawsAnalysis };
}
