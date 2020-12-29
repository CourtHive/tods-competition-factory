import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import {
  ASSIGN_BYE,
  REMOVE_ASSIGNMENT,
} from '../../../../constants/positionActionConstants';

it('can replace positioned participant with a bye', () => {
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

  let payload = Object.assign({}, option.payload, { replaceWithBye: true });
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

  // Now test that a BYE can be removed
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });

  option = result.validActions.find(
    (action) => action.type === REMOVE_ASSIGNMENT
  );

  payload = Object.assign({}, option.payload);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));

  ({ positionAssignments } = structures[0]);
  assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  expect(assignment.bye).toBeUndefined();

  // now check that BYE can be placed
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });

  option = result.validActions.find((action) => action.type === ASSIGN_BYE);
  payload = Object.assign({}, option.payload);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));

  ({ positionAssignments } = structures[0]);
  assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  expect(assignment.bye).toEqual(true);
});
