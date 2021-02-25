import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getOrderedDrawPositionPairs } from '../../../drawEngine/tests/testingUtilities';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';

it('supports entering DOUBLE_WALKOVER matchUpStatus', () => {
  // create an FMLC with the 1st position matchUp completed
  const drawProfiles = [
    {
      drawSize: 8,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  // get the first upcoming matchUp, which will be { roundPosition: 2 }
  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  const [matchUp] = upcomingMatchUps;
  const { matchUpId, roundPosition } = matchUp;
  expect(roundPosition).toEqual(2);

  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  const { matchUp: updatedMatchUp } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  });
  expect(updatedMatchUp.matchUpStatus).toEqual(DOUBLE_WALKOVER);

  const {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  let { positionAssignments } = getPositionAssignments({
    structure: consolationStructure,
  });
  const consolationByeDrawPositions = positionAssignments
    .filter(({ bye }) => bye)
    .map(({ drawPosition }) => drawPosition);
  expect(consolationByeDrawPositions).toEqual([1, 4]);

  const { orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined],
    [undefined, undefined],
    [1, undefined],
  ]);

  // remove outcome
  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId: matchUp.matchUpId,
    outcome: toBePlayed,
  });
  console.log(result);
});
