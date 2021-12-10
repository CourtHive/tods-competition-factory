import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import tournamentEngine from '../../sync';
import { drawEngine, mocksEngine } from '../../..';

import { MAIN } from '../../../constants/drawDefinitionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';

test('draw analysis can determine when draws are able to be pruned', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    // automated false: don't place the participantIds
    drawProfiles: [
      {
        drawSize: 32,
        participantsCount: 20,
        automated: false,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [mainStructure],
  } = getDrawStructures({
    drawDefinition,
    stage: MAIN,
    stageSequence: 1,
  });

  const placedParticipantIds = mainStructure.positionAssignments
    .map(({ participantId }) => participantId)
    .filter(Boolean);
  expect(placedParticipantIds.length).toEqual(0);

  let result = tournamentEngine.analyzeDraws();
  expect(result.drawsAnalysis.inactive.includes(drawId)).toEqual(true);
  expect(result.drawsAnalysis.positionsNoOutcomes).toEqual([]);
  expect(result.drawsAnalysis.canBePruned).toEqual([]);
  expect(result.drawsAnalysis.matchPlay).toEqual([]);

  const structureSelectedParticipantIds = drawDefinition.entries
    .filter((entry) => STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus))
    .map(({ participantId }) => participantId);

  structureSelectedParticipantIds.forEach((participantId, index) => {
    const drawPosition = index + 1;
    tournamentEngine.assignDrawPosition({
      structureId: mainStructure.structureId,
      participantId,
      drawPosition,
      drawId,
    });
  });

  result = tournamentEngine.analyzeDraws();
  expect(result.drawsAnalysis.positionsNoOutcomes.includes(drawId)).toEqual(
    true
  );
  expect(result.drawsAnalysis.inactive.includes(drawId)).toEqual(true);
  expect(result.drawsAnalysis.canBePruned).toEqual([]);
  expect(result.drawsAnalysis.matchPlay).toEqual([]);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });

  let { outcome } = mocksEngine.generateOutcome();
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: roundMatchUps[1][0].matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.analyzeDraws();
  expect(result.drawsAnalysis.canBePruned.includes(drawId)).toEqual(true);
  expect(result.drawsAnalysis.matchPlay.includes(drawId)).toEqual(true);
  expect(result.drawsAnalysis.positionsNoOutcomes).toEqual([]);
  expect(result.drawsAnalysis.inactive).toEqual([]);

  expect(result.drawsAnalysis.drawAnalysis[drawId].inactiveDraw).toEqual(false);
  expect(result.drawsAnalysis.drawAnalysis[drawId].isMatchPlay).toEqual(true);
  expect(
    result.drawsAnalysis.drawAnalysis[drawId].matchUpsWithWinningSideCount
  ).toEqual(1);

  const structureData =
    result.drawsAnalysis.drawAnalysis[drawId].structuresData[0];
  expect(structureData.unassignedPositionsCount).toEqual(12);
  expect(structureData.inactiveRounds.length).toEqual(4);
  expect(structureData.activeRounds.length).toEqual(1);

  result = tournamentEngine.analyzeTournament();
  expect(result.analysis.isDual).toEqual(false);
});
