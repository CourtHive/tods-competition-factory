import { generateOutcomeFromScoreString } from '../../../mocksEngine/generators/generateOutcomeFromScoreString';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

import {
  BYE,
  COMPLETED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { SCORE } from '../../../constants/matchUpActionConstants';

it('can create double bye and remove advanced participant when outcome is reset', () => {
  tournamentEngine.devContext(true);
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 5,
    },
  ];

  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let {
    completedMatchUps,
    upcomingMatchUps,
    byeMatchUps,
    pendingMatchUps,
  } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(byeMatchUps.length).toEqual(3);
  expect(completedMatchUps.length).toEqual(0);
  expect(pendingMatchUps.length).toEqual(2);
  expect(upcomingMatchUps.length).toEqual(2);

  let matchUp = byeMatchUps[0];
  let { structureId } = matchUp;

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    drawDefinition,
    structureId,
  });

  const drawPositionsToReplaceWithBYE = positionAssignments
    .filter(
      ({ drawPosition, participantId }) =>
        participantId && drawPosition > 1 && drawPosition < 8
    )
    .map(({ drawPosition }) => drawPosition);

  const expected = [
    undefined,
    undefined,
    { bye: 6, complete: 0, pending: 0, upcoming: 1 },
  ];

  drawPositionsToReplaceWithBYE.forEach((drawPosition, index) => {
    replaceWithBye({
      drawId,
      structureId,
      drawPosition,
      expectations: expected[index],
    });
  });

  // now complete final matchUp
  let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  let finalMatchUp = matchUps.find(({ roundNumber }) => roundNumber === 3);
  const { outcome } = generateOutcomeFromScoreString({
    scoreString: '6-1 6-1',
    winningSide: 2,
  });
  let { validActions } = tournamentEngine.matchUpActions(finalMatchUp);
  let scoreAction = validActions.find(({ type }) => type === SCORE);
  let { method, payload } = scoreAction;
  Object.assign(payload, { outcome });
  let result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));
  finalMatchUp = matchUps.find(({ roundNumber }) => roundNumber === 3);
  expect(finalMatchUp.matchUpStatus).toEqual(COMPLETED);

  ({
    completedMatchUps,
    upcomingMatchUps,
    byeMatchUps,
    pendingMatchUps,
  } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  }));
  expect(byeMatchUps.length).toEqual(6);
  expect(completedMatchUps.length).toEqual(1);
  expect(pendingMatchUps.length).toEqual(0);
  expect(upcomingMatchUps.length).toEqual(0);

  ({ validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition: 3,
  }));
  expect(validActions.map(({ type }) => type)).toEqual([]);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  const {
    activeDrawPositions,
    inactiveDrawPositions,
    byeDrawPositions,
  } = structureActiveDrawPositions({ drawDefinition, structureId });
  expect(activeDrawPositions.length).toEqual(8);
  expect(inactiveDrawPositions.length).toEqual(0);
  expect(byeDrawPositions.length).toEqual(6);
});

function replaceWithBye({ drawId, structureId, drawPosition, expectations }) {
  let { validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  let { method, payload } = validActions.find(({ type }) => type === BYE);
  let result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  checkExpectations({ drawId, expectations });
}

function checkExpectations({ drawId, expectations }) {
  if (!expectations) return;
  const {
    completedMatchUps,
    upcomingMatchUps,
    byeMatchUps,
    pendingMatchUps,
  } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  const expectedMatchUpsCount =
    completedMatchUps.length +
    upcomingMatchUps.length +
    byeMatchUps.length +
    pendingMatchUps.length;
  const expectationsTotal = Object.values(expectations).reduce((a, b) => a + b);
  if (expectationsTotal !== expectedMatchUpsCount) {
    console.log({ expectedMatchUpsCount, expectationsTotal });
  }
  expect(byeMatchUps.length).toEqual(expectations.bye);
  expect(completedMatchUps.length).toEqual(expectations.complete);
  expect(pendingMatchUps.length).toEqual(expectations.pending);
  expect(upcomingMatchUps.length).toEqual(expectations.upcoming);
  byeMatchUps.forEach(({ matchUpStatus }) =>
    expect(matchUpStatus).toEqual(BYE)
  );
  completedMatchUps.forEach(({ matchUpStatus }) =>
    expect(matchUpStatus).toEqual(COMPLETED)
  );
  pendingMatchUps.forEach(({ matchUpStatus }) =>
    expect(matchUpStatus).toEqual(TO_BE_PLAYED)
  );
  upcomingMatchUps.forEach(({ matchUpStatus }) =>
    expect(matchUpStatus).toEqual(TO_BE_PLAYED)
  );
}
