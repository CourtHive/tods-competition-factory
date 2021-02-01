import { replaceWithAlternate, replaceWithBye } from '../../testingUtilities';
import tournamentEngine from '../../../../tournamentEngine';
import { generateRange } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';

import {
  ALTERNATE_PARTICIPANT,
  ASSIGN_BYE,
} from '../../../../constants/positionActionConstants';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';
import { ALTERNATE } from '../../../../constants/entryStatusConstants';

it('supports replacing a BYE with a participant (DA or ALT)', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);

  expect(options.includes(ASSIGN_BYE)).toEqual(true);
  let option = result.validActions.find((action) => action.type === ASSIGN_BYE);

  let payload = Object.assign({}, option.payload, {
    replaceWithBye: true,
    entryStatus: ALTERNATE,
  });
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));

  let { positionAssignments } = structures[0];
  let assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  expect(assignment.bye).toEqual(true);

  // Now test that a BYE can be replaced
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(BYE)).toEqual(false);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);

  option = result.validActions.find(
    (action) => action.type === ALTERNATE_PARTICIPANT
  );

  const alternateParticipantId = option.availableAlternatesParticipantIds[0];
  payload = Object.assign({}, option.payload, { alternateParticipantId });
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
});

it('can replace BYE with ALTERNATE to Final in drawSize: 8 when 7 BYEs', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 8,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  const targetByeDrawPositions = generateRange(2, 9);
  targetByeDrawPositions.forEach((drawPosition) => {
    const result = replaceWithBye({
      drawId,
      structureId,
      drawPosition,
    });
    if (result.error) console.log('replaceWithBye', { drawPosition }, result);
  });

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  let { positionAssignments } = structures[0];
  const byeDrawPositions = positionAssignments
    .filter(({ bye }) => bye)
    .map(({ drawPosition }) => drawPosition);

  expect(byeDrawPositions).toEqual(targetByeDrawPositions);

  // replaceWithAlternate({ drawId, structureId, drawPosition: 8 });
  replaceWithAlternate({ drawId, structureId, drawPosition: 8 });
  let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  let finalMatchUp = matchUps.find(
    ({ finishingRound }) => finishingRound === 1
  );
  expect(finalMatchUp.drawPositions).toEqual([1, 8]);
  expect(finalMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);

  replaceWithBye({
    drawId,
    structureId,
    drawPosition: 8,
  });
  ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));
  finalMatchUp = matchUps.find(({ finishingRound }) => finishingRound === 1);
  expect(finalMatchUp.matchUpStatus).toEqual(BYE);
  expect(finalMatchUp.drawPositions).toEqual([1, 8]);

  let result = replaceWithAlternate({ drawId, structureId, drawPosition: 7 });
  expect(result.success).toEqual(true);
  ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));
  finalMatchUp = matchUps.find(({ finishingRound }) => finishingRound === 1);
  expect(finalMatchUp.drawPositions).toEqual([1, 7]);
  expect(finalMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
});
