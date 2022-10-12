import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { TALLY } from '../../../constants/extensionConstants';
import { RETIRED, WALKOVER } from '../../../constants/matchUpStatusConstants';

function getDrawPositionTally({ positionAssignments, drawPosition }) {
  return positionAssignments
    .find((assignment) => assignment.drawPosition === drawPosition)
    .extensions.find(({ name }) => name === TALLY)?.value;
}

it('properly interprets tallyPolicies', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      eventType: SINGLES,
      participantsCount: 4,
      drawType: ROUND_ROBIN,
      outcomes: [
        {
          drawPositions: [1, 2],
          matchUpStatus: WALKOVER,
          winningSide: 2,
        },
        {
          drawPositions: [1, 3],
          scoreString: '6-3',
          matchUpStatus: RETIRED,
          winningSide: 2,
        },
        {
          drawPositions: [1, 4],
          matchUpStatus: WALKOVER,
          winningSide: 2,
        },
        {
          drawPositions: [2, 3],
          scoreString: '6-2 6-4',
          winningSide: 1,
        },
        {
          drawPositions: [2, 4],
          scoreString: '6-1 7-5',
          winningSide: 2,
        },
        {
          drawPositions: [3, 4],
          scoreString: '7-5 3-6 [10-4]',
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
  });
  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  console.log(
    matchUps.map(({ drawPositions, score, winningSide, matchUpStatus }) => ({
      drawPositions,
      winningSide,
      score,
      matchUpStatus,
    }))
  );

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { structureId } = drawDefinition.structures[0];
  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    drawId,
    structureId,
  });
  const dp1 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 1,
  });
  /*
  expect(dp1.setsWon).toEqual(4);
  expect(dp1.setsLost).toEqual(2);
  expect(dp1.gamesWon).toEqual(26);
  expect(dp1.gamesLost).toEqual(16);
  expect(dp1.matchUpsWon).toEqual(2);
  expect(dp1.matchUpsLost).toEqual(1);
  expect(dp1.ties).toBeUndefined();
  expect(dp1.result).toEqual('2/1');
  */

  const dp2 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 2,
  });
  /*;
  expect(dp2.setsWon).toEqual(0);
  expect(dp2.setsLost).toEqual(2);
  expect(dp2.gamesWon).toEqual(2);
  expect(dp2.gamesLost).toEqual(12);
  expect(dp2.matchUpsWon).toEqual(0);
  expect(dp2.matchUpsLost).toEqual(1);
  expect(dp2.ties).toBeUndefined();
  expect(dp2.result).toEqual('0/1');
  */

  const dp3 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 3,
  });
  /*
  expect(dp3.setsWon).toEqual(2);
  expect(dp3.setsLost).toEqual(0);
  expect(dp3.gamesWon).toEqual(12);
  expect(dp3.gamesLost).toEqual(2);
  expect(dp3.matchUpsWon).toEqual(1);
  expect(dp3.matchUpsLost).toEqual(0);
  expect(dp3.ties).toBeUndefined();
  expect(dp3.result).toEqual('1/0');
  */

  const dp4 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 3,
  });

  console.log({ dp1, dp2, dp3, dp4 });
});
