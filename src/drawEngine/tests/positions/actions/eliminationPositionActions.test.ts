import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import { expect, it, test } from 'vitest';
import drawEngine from '../../../sync';

import { SINGLES_EVENT } from '../../../../constants/eventConstants';
import { MAIN } from '../../../../constants/drawDefinitionConstants';
import {
  INVALID_DRAW_POSITION,
  INVALID_VALUES,
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
} from '../../../../constants/positionActionConstants';

it('can return accurate position details when requesting positionActions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [
        {
          scoreString: '6-2 6-1',
          roundPosition: 3,
          roundNumber: 1,
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    drawPosition,
    structureId,
    drawId,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  drawEngine.setState(drawDefinition);

  drawPosition = 2;
  result = tournamentEngine.positionActions({
    drawPosition,
    structureId,
    drawId,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);

  drawPosition = 0;
  result = tournamentEngine.positionActions({
    drawPosition,
    structureId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);

  drawPosition = 40;
  result = tournamentEngine.positionActions({
    drawPosition,
    structureId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);
});

it('returns correct positionActions for participants in completed matchUps', () => {
  const drawProfiles = [
    {
      participantsCount: 32,
      drawSize: 32,
      outcomes: [
        {
          scoreString: '6-2 6-1',
          roundPosition: 1,
          roundNumber: 1,
          winningSide: 1,
        },
      ],
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
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
    drawPosition,
    structureId,
    drawId,
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
    drawPosition,
    structureId,
    drawId,
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
    drawPosition,
    structureId,
    drawId,
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
      participantsCount: 30,
      drawSize: 32,
      outcomes: [
        {
          scoreString: '6-2 6-1',
          roundPosition: 2,
          roundNumber: 1,
          winningSide: 1,
        },
        {
          scoreString: '6-2 6-1',
          roundPosition: 1,
          roundNumber: 2,
          winningSide: 1,
        },
      ],
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
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
    drawPosition,
    structureId,
    drawId,
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
    drawPosition,
    structureId,
    drawId,
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
    drawPosition,
    structureId,
    drawId,
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
    drawPosition,
    structureId,
    drawId,
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

  // now check an inactive assigned drawPosition
  drawPosition = 5;
  targetMatchUp = matchUps.find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).not.toEqual(BYE);

  result = tournamentEngine.positionActions({
    drawPosition,
    structureId,
    drawId,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SEED_VALUE)).toEqual(false); // because structure is active
});

test('seedValues can be defined for unseeded positions', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 16, seedsCount: 4 }],
  });

  tournamentEngine.setState(tournamentRecord);
  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let p = tournamentEngine.getParticipants({
    withScaleValues: true,
    withSeeding: true,
    withEvents: true,
    withDraws: true,
  });
  let participantsWithSeedings = p.participants.filter(
    (participant) => participant.seedings?.[SINGLES_EVENT]
  );
  expect(participantsWithSeedings.length).toEqual(4);

  let result = tournamentEngine.positionActions({
    drawPosition: 2,
    structureId,
    drawId,
  });
  const options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SEED_VALUE)).toEqual(true);

  const action = result.validActions.find(
    (action) => action.type === SEED_VALUE
  );
  const { method, payload } = action;

  payload.seedValue = 'x';
  result = tournamentEngine[method]({ ...payload });
  expect(result.error).toEqual(INVALID_VALUES);

  payload.seedValue = '5';
  result = tournamentEngine[method]({ ...payload });
  expect(result.success).toEqual(true);

  p = tournamentEngine.getParticipants({
    withScaleValues: true,
    withSeeding: true,
    withEvents: true,
    withDraws: true,
  });
  participantsWithSeedings = p.participants.filter(
    (participant) => participant.seedings?.[SINGLES_EVENT]
  );
  expect(participantsWithSeedings.length).toEqual(5);

  for (const participant of participantsWithSeedings) {
    const { participantId } = participant;
    expect(participant.seedings[SINGLES_EVENT].length).toBeDefined();
    expect(
      p.participantMap[participantId].events[eventId].seedAssignments[MAIN]
        .seedValue
    ).toBeDefined();
    expect(
      p.participantMap[participantId].draws[drawId].seedAssignments[MAIN]
        .seedValue
    ).toBeDefined();
  }
});
