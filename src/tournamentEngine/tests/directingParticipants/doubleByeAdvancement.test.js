import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';
// import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';

import { BYE } from '../../../constants/matchUpStatusConstants';

it('can create double bye and replace bye with alternate', () => {
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
  let { structureId, drawPositions } = matchUp;
  let drawPosition = drawPositions[0];
  let { validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  let action = validActions.find(({ type }) => type === BYE);
  const { method, payload } = action;
  let result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  ({
    completedMatchUps,
    upcomingMatchUps,
    byeMatchUps,
    pendingMatchUps,
  } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  }));
  expect(byeMatchUps.length).toEqual(2);
  expect(completedMatchUps.length).toEqual(3);
  expect(pendingMatchUps.length).toEqual(1);
  expect(upcomingMatchUps.length).toEqual(1);
});
