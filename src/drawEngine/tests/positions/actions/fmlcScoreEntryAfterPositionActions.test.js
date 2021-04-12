import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import {
  replaceWithBye,
  getOrderedDrawPositionPairs,
} from '../../testingUtilities';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';

// tests that manual placement of a BYE in consolation structure does not prevent
// entry of scores in main draw matchUps with links disabled by consolation positionActions
it('able to enter MAIN structure score after manually placing BYE in CONSOLATION', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 8,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  const consolationStructureId = consolationStructure.structureId;
  const policyDefinition = POLICY_POSITION_ACTIONS_UNRESTRICTED;
  replaceWithBye({
    drawId,
    structureId: consolationStructureId,
    drawPosition: 1,
    policyDefinition,
  });

  const contextFilters = { structureIds: [mainStructure.structureId] };
  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    contextFilters,
  });

  let targetMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 1 && roundPosition === 1
  );

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });

  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  targetMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 1 && roundPosition === 2
  );
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  const { filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 3],
    [],
    [],
  ]);
});
