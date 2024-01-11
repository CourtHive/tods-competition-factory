import tournamentEngine from '../../../../engines/syncEngine';
import mocksEngine from '../../../../../assemblies/engines/mock';
import { expect, it } from 'vitest';
import {
  replaceWithBye,
  getOrderedDrawPositionPairs,
} from '../../../drawDefinitions/testingUtilities';

import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';
import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../../../constants/drawDefinitionConstants';

// tests that manual placement of a BYE in consolation structure does not prevent
// entry of scores in main draw matchUps with links disabled by consolation positionActions
it('able to enter MAIN structure score after manually placing BYE in CONSOLATION', () => {
  const drawProfiles = [
    {
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      participantsCount: 8,
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
  });

  const {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.setState(tournamentRecord).getEvent({ drawId });

  const consolationStructureId = consolationStructure.structureId;
  const policyDefinitions = POLICY_POSITION_ACTIONS_UNRESTRICTED;
  replaceWithBye({
    structureId: consolationStructureId,
    policyDefinitions,
    drawPosition: 1,
    drawId,
  });

  const contextFilters = { structureIds: [mainStructure.structureId] };
  const { matchUps } = tournamentEngine.allDrawMatchUps({
    contextFilters,
    drawId,
  });

  let targetMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 1 && roundPosition === 1
  );

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });

  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  targetMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 1 && roundPosition === 2
  );
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  const { filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  expect(filteredOrderedPairs.filter((p) => p?.length)).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 3],
  ]);
});
