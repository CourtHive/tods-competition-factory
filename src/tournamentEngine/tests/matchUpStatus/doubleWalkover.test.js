import { getOrderedDrawPositionPairs } from '../../../drawEngine/tests/testingUtilities';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

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

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  const mainStructureOrderedPairs = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1],
    [],
    [],
  ];

  const consolationStructureOrderedPairs = [[3, 4], [5, 6], [1], [2], []];

  let { filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  expect(filteredOrderedPairs).toEqual(mainStructureOrderedPairs);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual(consolationStructureOrderedPairs);

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

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  let { positionAssignments } = getPositionAssignments({
    structure: consolationStructure,
  });
  const consolationByeDrawPositions = positionAssignments
    .filter(({ bye }) => bye)
    .map(({ drawPosition }) => drawPosition);
  expect(consolationByeDrawPositions).toEqual([1, 4]);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1],
    [],
    [1],
  ]);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual([[3, 4], [5, 6], [1, 3], [2], [3]]);

  // remove outcome
  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId: matchUp.matchUpId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));
  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual(mainStructureOrderedPairs);
  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual(consolationStructureOrderedPairs);
});
