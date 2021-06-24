import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import {
  getOrderedDrawPositionPairs,
  replaceWithBye,
  replaceWithAlternate,
  removeAssignment,
} from '../../testingUtilities';

import { FEED_IN_CHAMPIONSHIP } from '../../../../constants/drawDefinitionConstants';

it('can remove transitive BYEs in consolation of FIC', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 8,
      drawType: FEED_IN_CHAMPIONSHIP,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.setState(tournamentRecord).getEvent({ drawId });

  const mainMatchUps = mainStructure.matchUps;
  let finalMatchUp = mainMatchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 3 && roundPosition === 1
  );
  expect(finalMatchUp.drawPositions.filter((f) => f)).toEqual([]);

  let { orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
  ]);

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [4, 5],
    [6, 7],
    [undefined, 2],
    [undefined, 3],
    [undefined, undefined],
    [undefined, 1],
  ]);

  let assignedParticipantIds = mainStructure.positionAssignments.filter(
    ({ participantId }) => participantId
  );
  expect(assignedParticipantIds.length).toEqual(8);

  let assignedByes = mainStructure.positionAssignments.filter(({ bye }) => bye);
  expect(assignedByes.length).toEqual(0);

  replaceWithByes({
    drawPositions: [1, 8, 3, 2, 4, 7, 6, 5],
    drawId,
    structureId: mainStructure.structureId,
  });

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));

  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 3],
    [6, 8],
    [3, 6],
  ]);

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));

  expect(orderedPairs).toEqual([
    [4, 5],
    [6, 7],
    [2, 4],
    [3, 7],
    [4, 7],
    [1, 7],
  ]);

  assignedParticipantIds = mainStructure.positionAssignments.filter(
    ({ participantId }) => participantId
  );
  expect(assignedParticipantIds.length).toEqual(0);
  assignedByes = mainStructure.positionAssignments.filter(({ bye }) => bye);
  expect(assignedByes.length).toEqual(8);

  assignedByes = consolationStructure.positionAssignments.filter(
    ({ bye }) => bye
  );
  expect(assignedByes.length).toEqual(7);

  replaceWithAlternates({
    drawPositions: [3, 7],
    drawId,
    structureId: mainStructure.structureId,
  });

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));

  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 3],
    [6, 7],
    [3, 7],
  ]);

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));

  // consolation structure positions have not changed
  expect(orderedPairs).toEqual([
    [4, 5],
    [6, 7],
    [2, 4],
    [3, 7],
    [4, 7],
    [1, 7],
  ]);

  assignedParticipantIds = mainStructure.positionAssignments.filter(
    ({ participantId }) => participantId
  );
  expect(assignedParticipantIds.length).toEqual(2);
  assignedByes = mainStructure.positionAssignments.filter(({ bye }) => bye);
  expect(assignedByes.length).toEqual(6);
  assignedByes = consolationStructure.positionAssignments.filter(
    ({ bye }) => bye
  );
  expect(assignedByes.length).toEqual(6);

  tournamentEngine.devContext(true);

  removeAssignment({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition: 4,
  });

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined],
    [6, 7],
    [undefined, 7],
  ]);

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [4, 5],
    [6, 7],
    [2, undefined],
    [3, 7],
    [undefined, 7],
    [1, undefined],
  ]);
});

function replaceWithByes({ drawPositions, drawId, structureId }) {
  drawPositions.forEach((drawPosition) => {
    replaceWithBye({ drawId, structureId, drawPosition });
  });
}
function replaceWithAlternates({ drawPositions, drawId, structureId }) {
  drawPositions.forEach((drawPosition) => {
    replaceWithAlternate({ drawId, structureId, drawPosition });
  });
}
