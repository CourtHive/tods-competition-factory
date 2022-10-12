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
  expect(dp1.groupOrder).toEqual(4);

  const dp2 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 2,
  });
  expect(dp2.groupOrder).toEqual(2);

  const dp3 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 3,
  });
  expect(dp3.groupOrder).toEqual(3);

  const dp4 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 4,
  });
  expect(dp4.groupOrder).toEqual(1);
});
