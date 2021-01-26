import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';
import {
  SWAP_PARTICIPANTS,
  ADD_PENALTY,
  ADD_NICKNAME,
  REMOVE_ASSIGNMENT,
  ALTERNATE_PARTICIPANT,
  ASSIGN_BYE,
  WITHDRAW_PARTICIPANT,
} from '../../../../constants/positionActionConstants';

it('can return accurate position details when requesting positionActions', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      participantsCount: 15,
      drawType: ROUND_ROBIN,
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

  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ADD_PENALTY)).toEqual(true);
  expect(options.includes(ADD_NICKNAME)).toEqual(true);
  expect(options.includes(ASSIGN_BYE)).toEqual(true);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  expect(options.includes(WITHDRAW_PARTICIPANT)).toEqual(true);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);

  drawPosition = 2;
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
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  // expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true); temporarily disabled
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
  expect(options.includes(WITHDRAW_PARTICIPANT)).toEqual(false);
});
