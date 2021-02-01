import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import {
  ASSIGN_BYE,
  // REMOVE_ASSIGNMENT,
} from '../../../../constants/positionActionConstants';
import {
  // ALTERNATE,
  DIRECT_ACCEPTANCE,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';
import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';
import { replaceWithAlternate, replaceWithBye } from '../../testingUtilities';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';
import { instanceCount } from '../../../../utilities';

it('can replace positioned participant with a bye and move to ALTERNATEs', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      participantsCount: 4,
      drawType: ROUND_ROBIN,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  let {
    drawDefinition: {
      structures: [structure],
    },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structure.structureId;

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[TO_BE_PLAYED]).toEqual(6);

  let result = replaceWithBye({ drawId, structureId, drawPosition: 1 });
  expect(result.success).toEqual(true);
  result = replaceWithBye({ drawId, structureId, drawPosition: 2 });
  expect(result.success).toEqual(true);
  result = replaceWithBye({ drawId, structureId, drawPosition: 3 });
  expect(result.success).toEqual(true);
  result = replaceWithBye({ drawId, structureId, drawPosition: 4 });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[BYE]).toEqual(6);

  console.log('############# assigning drawPosition 1');
  result = replaceWithAlternate({ drawId, structureId, drawPosition: 1 });
  expect(result.success).toEqual(true);
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[BYE]).toEqual(6);
  /*

  console.log('############# assigning drawPosition 2');
  result = replaceWithAlternate({ drawId, structureId, drawPosition: 2 });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  console.log(matchUpStatuses);

  result = replaceWithAlternate({ drawId, structureId, drawPosition: 3 });
  expect(result.success).toEqual(true);
  result = replaceWithAlternate({ drawId, structureId, drawPosition: 4 });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[TO_BE_PLAYED]).toEqual(6);
  */
});

it.skip('can withdraw and replace positioned participant with a bye', () => {
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
    event,
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let { byeMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  expect(byeMatchUps.length).toEqual(2);

  let drawPosition = 1;
  let { positionAssignments } = structures[0];
  let assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  expect(!!assignment.bye).toEqual(false);
  let byeAssignments = positionAssignments.filter(({ bye }) => bye);
  expect(byeAssignments.length).toEqual(2);

  expect(byeAssignments.length).toEqual(2);
  const participantId = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  ).participantId;
  const entryStatus = event.entries.find(
    (entry) => entry.participantId === participantId
  ).entryStatus;
  expect(entryStatus).toEqual(DIRECT_ACCEPTANCE);

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
    entryStatus: WITHDRAWN,
  });
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    event,
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));

  const updatedEntryStatus = event.entries.find(
    (entry) => entry.participantId === participantId
  ).entryStatus;
  expect(updatedEntryStatus).toEqual(WITHDRAWN);

  ({ positionAssignments } = structures[0]);
  assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  expect(assignment.bye).toEqual(true);
  byeAssignments = positionAssignments.filter(({ bye }) => bye);
  expect(byeAssignments.length).toEqual(3);

  ({ byeMatchUps } = tournamentEngine.drawMatchUps({ drawId }));
  expect(byeMatchUps.length).toEqual(3);
});
