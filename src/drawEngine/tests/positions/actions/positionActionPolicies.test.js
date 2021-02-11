import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';

import {
  ADD_NICKNAME,
  ADD_PENALTY,
  ALTERNATE_PARTICIPANT,
  ASSIGN_BYE,
  REMOVE_ASSIGNMENT,
  SEED_VALUE,
  SWAP_PARTICIPANTS,
  WITHDRAW_PARTICIPANT,
} from '../../../../constants/positionActionConstants';
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
      participantsCount: 30,
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

  const allActions = [
    REMOVE_ASSIGNMENT,
    WITHDRAW_PARTICIPANT,
    ASSIGN_BYE,
    SEED_VALUE,
    ADD_PENALTY,
    ADD_NICKNAME,
    SWAP_PARTICIPANTS,
    ALTERNATE_PARTICIPANT,
  ];
  const noMovementActions = [SEED_VALUE, ADD_PENALTY, ADD_NICKNAME];

  // will be testing the available positionActions for { drawPosition: 1 }
  // initially in mainStructure followed by consolationStructure
  let drawPosition = 3;

  // default configuration should return all validActions
  let result = tournamentEngine.positionActions({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.validActions.map((a) => a.type)).toEqual(allActions);

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
  expect(result.validActions.map(({ type }) => type)).toEqual(
    noMovementActions
  );

  // now check the available positionActions for the consolation structure
  result = tournamentEngine.positionActions({
    structureId: consolationStructure.structureId,
    drawPosition,
    drawId,
  });
  expect(result.validActions.length).toEqual(0);

  let contextFilters = { stages: [MAIN] };
  let { upcomingMatchUps } = tournamentEngine.tournamentMatchUps({
    contextFilters,
  });

  const firstRoundMain = upcomingMatchUps.filter(
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
  expect(result.validActions.map(({ type }) => type)).toEqual(
    noMovementActions
  );

  contextFilters = { stages: [CONSOLATION] };
  ({ upcomingMatchUps } = tournamentEngine.tournamentMatchUps({
    contextFilters,
  }));
  let firstRoundConsolation = upcomingMatchUps.filter(
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
  expect(result.validActions.map(({ type }) => type)).toEqual(
    noMovementActions
  );

  // now check the available positionActions for the consolation structure when participants are present
  // ...when an unrestricted policyDefinition is applied
  result = tournamentEngine.positionActions({
    policyDefinition: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    structureId: consolationStructure.structureId,
    drawPosition: firstRoundConsolationDrawPositions[0],
    drawId,
  });
  expect(result.validActions.map((a) => a.type)).toEqual([
    REMOVE_ASSIGNMENT,
    WITHDRAW_PARTICIPANT,
    ASSIGN_BYE,
    SEED_VALUE,
    ADD_PENALTY,
    ADD_NICKNAME,
    SWAP_PARTICIPANTS,
  ]);
});
