import { generateOutcomeFromScoreString } from '../../../mocksEngine/generators/generateOutcomeFromScoreString';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../..';

import {
  BYE,
  COMPLETED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { ALTERNATE } from '../../../constants/entryStatusConstants';
import { SCORE } from '../../../constants/matchUpActionConstants';

it('can create double bye and remove advanced participant when outcome is reset', () => {
  tournamentEngine.devContext(true);
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 7,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
      ],
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
  expect(byeMatchUps.length).toEqual(1);
  expect(completedMatchUps.length).toEqual(3);
  expect(pendingMatchUps.length).toEqual(1);
  expect(upcomingMatchUps.length).toEqual(2);

  let matchUp = byeMatchUps[0];
  let { structureId } = matchUp;
  let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  let finalMatchUp = matchUps.find(({ roundNumber }) => roundNumber === 3);
  expect(finalMatchUp.drawPositions.filter((f) => f)).toEqual([]);

  // now replace the participant in { drawPosition; 1 } with a BYE
  replaceWithBye({
    drawId,
    structureId,
    drawPosition: 1,
    expectations: { bye: 2, complete: 3, pending: 1, upcoming: 1 },
  });

  ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));
  finalMatchUp = matchUps.find(({ roundNumber }) => roundNumber === 3);
  expect(finalMatchUp.drawPositions.filter((f) => f)).toEqual([3]);

  // now remove the result for matchUp: { roundNumber: 1, roundPosition: 2 }
  matchUp = matchUps.find(
    (matchUp) => matchUp.roundNumber === 1 && matchUp.roundPosition === 2
  );
  let { validActions } = tournamentEngine.matchUpActions(matchUp);
  let scoreAction = validActions.find(({ type }) => type === SCORE);
  let { method, params } = scoreAction;

  Object.assign(params, { outcome: toBePlayed });
  let result = tournamentEngine[method](params);
  expect(result.success).toEqual(true);
  checkExpectations({
    drawId,
    expectations: { bye: 2, complete: 2, pending: 1, upcoming: 2 },
  });
  ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));

  finalMatchUp = matchUps.find(({ roundNumber }) => roundNumber === 3);
  expect(finalMatchUp.drawPositions.filter((f) => f)).toEqual([]);
});

it.only('can create double bye and replace bye with alternate', () => {
  tournamentEngine.devContext(true);
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 7,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-4',
          winningSide: 1,
        },
      ],
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
  expect(byeMatchUps.length).toEqual(1);
  expect(completedMatchUps.length).toEqual(3);
  expect(pendingMatchUps.length).toEqual(1);
  expect(upcomingMatchUps.length).toEqual(2);

  let matchUp = byeMatchUps[0];
  let { structureId } = matchUp;

  // now replace the participant in { drawPosition; 1 } with a BYE
  replaceWithBye({
    drawId,
    structureId,
    drawPosition: 1,
    expectations: { bye: 2, complete: 3, pending: 1, upcoming: 1 },
  });

  // now again replace the BYE with an alternate
  replaceWithAlternate({
    drawId,
    structureId,
    drawPosition: 1,
    expectations: { bye: 1, complete: 3, pending: 1, upcoming: 2 },
  });

  // now replace the participant in { drawPosition; 1 } with a BYE
  replaceWithBye({
    drawId,
    structureId,
    drawPosition: 1,
    expectations: { bye: 2, complete: 3, pending: 1, upcoming: 1 },
  });

  // now again replace the BYE with an alternate
  replaceWithAlternate({
    drawId,
    structureId,
    drawPosition: 2,
    expectations: { bye: 1, complete: 3, pending: 1, upcoming: 2 },
  });

  // now replace the participant in { drawPosition; 2 } with a BYE
  replaceWithBye({
    drawId,
    structureId,
    drawPosition: 2,
    expectations: { bye: 2, complete: 3, pending: 1, upcoming: 1 },
  });

  // now remove the result for matchUp: { roundNumber: 1, roundPosition: 2 }
  let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  matchUp = matchUps.find(
    (matchUp) => matchUp.roundNumber === 1 && matchUp.roundPosition === 2
  );
  let { validActions } = tournamentEngine.matchUpActions(matchUp);
  let scoreAction = validActions.find(({ type }) => type === SCORE);
  let { method, params } = scoreAction;

  Object.assign(params, { outcome: toBePlayed });
  let result = tournamentEngine[method](params);
  expect(result.success).toEqual(true);
  checkExpectations({
    drawId,
    expectations: { bye: 2, complete: 2, pending: 1, upcoming: 2 },
  });

  // now set winningSide again
  const { outcome } = generateOutcomeFromScoreString({
    scoreString: '6-1 6-1',
    winningSide: 2,
  });
  ({ validActions } = tournamentEngine.matchUpActions(matchUp));
  scoreAction = validActions.find(({ type }) => type === SCORE);
  ({ method, params } = scoreAction);

  Object.assign(params, { outcome, winningSide: outcome.winningSide });
  result = tournamentEngine[method](params);
  expect(result.success).toEqual(true);
  checkExpectations({
    drawId,
    expectations: { bye: 2, complete: 3, pending: 1, upcoming: 1 },
  });
  ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));
  const finalMatchUp = matchUps.find(
    (matchUp) => matchUp.roundNumber === 3 && matchUp.roundPosition === 1
  );
  console.log({ finalMatchUp });
  /*
  ({ validActions } = tournamentEngine.matchUpActions(matchUp));
  scoreAction = validActions.find(({ type }) => type === SCORE);
  ({ method, params } = scoreAction);

  Object.assign(params, { outcome: toBePlayed });
  result = tournamentEngine[method](params);
  expect(result.success).toEqual(true);
  checkExpectations({
    drawId,
    expectations: { bye: 2, complete: 2, pending: 1, upcoming: 2 },
  });

  // now replace the participant in { drawPosition; 3 } with a BYE
  replaceWithBye({
    drawId,
    structureId,
    drawPosition: 3,
    expectations: { bye: 3, complete: 2, pending: 1, upcoming: 1 },
  });

  // now replace the participant in { drawPosition; 4 } with a BYE
  replaceWithBye({
    drawId,
    structureId,
    drawPosition: 4,
    expectations: { bye: 4, complete: 2, pending: 0, upcoming: 1 },
  });
  */
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

function replaceWithAlternate({
  drawId,
  structureId,
  drawPosition,
  expectations,
}) {
  const { validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  let result = validActions.find(({ type }) => type === ALTERNATE);
  let { method, payload, availableAlternatesParticipantIds } = result;
  let alternateParticipantId = availableAlternatesParticipantIds[0];
  Object.assign(payload, { alternateParticipantId });
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
  checkExpectations({ drawId, expectations });
}

function checkExpectations({ drawId, expectations }) {
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
