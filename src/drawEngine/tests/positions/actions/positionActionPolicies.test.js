import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';

/*
import {
  SWAP_PARTICIPANTS,
  ADD_PENALTY,
  ADD_NICKNAME,
  REMOVE_ASSIGNMENT,
  ALTERNATE_PARTICIPANT,
  ASSIGN_BYE,
} from '../../../../constants/positionActionConstants';
*/
import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../../constants/drawDefinitionConstants';
import POLICY_POSITION_ACTIONS_DISABLED from '../../../../fixtures/policies/POLICY_POSITION_ACTIONS_DISABLED';
import POLICY_POSITION_ACTIONS_NO_MOVEMENT from '../../../../fixtures/policies/POLICY_POSITION_ACTIONS_NO_MOVEMENT';
import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';

// demonstrates that policyDefinitions can be used to change the behavior of positionActions
it('supports policyDefinitions in positionActions', () => {
  const drawProfiles = [
    {
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      drawSize: 32,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  // will be testing the available positionActions for { drawPosition: 1 }
  // initially in mainStructure followed by consolationStructure
  let drawPosition = 1;

  // default configuration should return all validActions
  let result = tournamentEngine.positionActions({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.validActions.length).toBeGreaterThan(3);

  // policyDefinition to disable all actions
  let policyDefinition = POLICY_POSITION_ACTIONS_DISABLED;
  result = tournamentEngine.positionActions({
    structureId: mainStructure.structureId,
    policyDefinition,
    drawPosition,
    drawId,
  });
  expect(result.validActions.length).toEqual(0);

  // policyDefinition to only allow actions not related to movement
  // the three actions below are specifically enabled by the policy
  policyDefinition = POLICY_POSITION_ACTIONS_NO_MOVEMENT;
  result = tournamentEngine.positionActions({
    structureId: mainStructure.structureId,
    policyDefinition,
    drawPosition,
    drawId,
  });
  expect(result.validActions.map(({ type }) => type)).toEqual([
    'SEED_VALUE',
    'PENALTY',
    'NICKNAME',
  ]);

  // now check the available positionActions for the consolation structure
  result = tournamentEngine.positionActions({
    structureId: consolationStructure.structureId,
    drawPosition,
    drawId,
  });
  expect(result.validActions.length).toEqual(0);

  let contextFilters = { stages: [MAIN] };
  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters,
  });

  const firstRoundMain = matchUps.filter(
    ({ roundNumber }) => roundNumber === 1
  );

  firstRoundMain.forEach(({ matchUpId }) => {
    const result = tournamentEngine.setMatchUpStatus({
      drawId,
      matchUpId,
      outcome: { winningSide: 1 },
    });
    expect(result.success).toEqual(true);
  });

  // since all first round matchUps have been completed...
  // ...validActions for activeDrawPositions should be restricted; no partcipant movement
  result = tournamentEngine.positionActions({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(true);
  expect(result.validActions.map(({ type }) => type)).toEqual([
    'SEED_VALUE',
    'PENALTY',
    'NICKNAME',
  ]);

  contextFilters = { stages: [CONSOLATION] };
  ({ matchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters,
  }));
  let firstRoundConsolation = matchUps.filter(
    ({ roundNumber }) => roundNumber === 1
  );
  // every firstRoundConsolation matchUp should be readyToScore...
  // ...which means each matchUp must have participantsAssigned
  expect(
    firstRoundConsolation.every(({ readyToScore }) => readyToScore)
  ).toEqual(true);

  const firstRoundConsolationDrawPositions = firstRoundConsolation
    .map(({ drawPositions }) => drawPositions)
    .flat();

  // now check the available positionActions for the consolation structure when participants are present
  result = tournamentEngine.positionActions({
    structureId: consolationStructure.structureId,
    drawPosition: firstRoundConsolationDrawPositions[0],
    drawId,
  });
  expect(result.hasPositionAssigned).toEqual(true);
  expect(result.validActions.map(({ type }) => type)).toEqual([
    'SEED_VALUE',
    'PENALTY',
    'NICKNAME',
  ]);

  // now check the available positionActions for the consolation structure when participants are present
  // ...when an unrestricted policyDefinition is applied
  result = tournamentEngine.positionActions({
    policyDefinition: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    structureId: consolationStructure.structureId,
    drawPosition: firstRoundConsolationDrawPositions[0],
    drawId,
  });
  console.log(result);
});
