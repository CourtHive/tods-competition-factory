import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';

import {
  INVALID_DRAW_POSITION,
  INVALID_PARTICIPANT_ID,
} from '../../../../constants/errorConditionConstants';
import {
  BYE,
  COMPLETED,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';
import {
  SWAP_PARTICIPANTS,
  ADD_PENALTY,
  ADD_NICKNAME,
  REMOVE_ASSIGNMENT,
  ALTERNATE_PARTICIPANT,
  ASSIGN_BYE,
  SEED_VALUE,
  SEED_VALUE_METHOD,
} from '../../../../constants/positionActionConstants';
import drawEngine from '../../../sync';

it('can return accurate position details when requesting positionActions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  const seedAssignmentAction = result.validActions.find(
    ({ type }) => type === SEED_VALUE
  );
  expect(seedAssignmentAction.method).toEqual(SEED_VALUE_METHOD);
  const { method, payload } = seedAssignmentAction;
  payload.seedValue = 'One';
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  payload.participantId = 'bogus';
  result = tournamentEngine[method](payload);
  expect(result.error).toEqual(INVALID_PARTICIPANT_ID);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  drawEngine.setState(drawDefinition);
  let { seedAssignments } = drawEngine.getStructureSeedAssignments({
    structureId,
  });
  expect(seedAssignments.length).toEqual(1);
  expect(seedAssignments[0].seedValue).toEqual('One');

  drawPosition = 2;
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);

  drawPosition = 0;
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);

  drawPosition = 40;
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);
});

it('returns correct positionActions for participants in completed matchUps', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 32,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  let drawPosition = 1;
  let targetMatchUp = matchUps.find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(COMPLETED);

  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(true);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(true);
  expect(options.includes(ADD_NICKNAME)).toEqual(true);
  expect(options.includes(ASSIGN_BYE)).toEqual(false);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(false);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(false);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(false);

  // now check that loser position is considered active
  drawPosition = 2;
  targetMatchUp = matchUps.find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(COMPLETED);

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(true);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(true);
  expect(options.includes(ADD_NICKNAME)).toEqual(true);
  expect(options.includes(ASSIGN_BYE)).toEqual(false);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(false);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(false);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(false);

  // now check inactive drawPosition
  drawPosition = 3;
  targetMatchUp = matchUps.find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(true);
  expect(options.includes(ADD_NICKNAME)).toEqual(true);
  expect(options.includes(ASSIGN_BYE)).toEqual(true);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(false); // there are no participants with entryStatus: ALTERNATE
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
});

it('returns correct positionActions for BYE positions where paired participants are in completed matchUps', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  let drawPosition = 1;
  let targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === 2 && matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(COMPLETED);

  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(true);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(true);
  expect(options.includes(ADD_NICKNAME)).toEqual(true);
  expect(options.includes(ASSIGN_BYE)).toEqual(false);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(false);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(false);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(false);

  // now check that BYE position is considered active
  drawPosition = 2;
  targetMatchUp = matchUps.find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(true);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);

  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(false);
  expect(options.includes(ADD_NICKNAME)).toEqual(false);
  expect(options.includes(ASSIGN_BYE)).toEqual(false);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(false);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(false);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(false);

  // now check inactive BYE position
  drawPosition = 31;
  targetMatchUp = matchUps.find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);

  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(false);
  expect(options.includes(ADD_NICKNAME)).toEqual(false);
  expect(options.includes(ASSIGN_BYE)).toEqual(false);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true); // in this case there are 2 alternates
  // expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true); // temporarily disabled

  // now check inactive position paired with BYE
  drawPosition = 32;
  targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === 1 && matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(true);
  expect(options.includes(ADD_NICKNAME)).toEqual(true);
  expect(options.includes(ASSIGN_BYE)).toEqual(true); // TODO: policy setting whether to allow double byes
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true); // in this case there are 2 alternates
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
});
