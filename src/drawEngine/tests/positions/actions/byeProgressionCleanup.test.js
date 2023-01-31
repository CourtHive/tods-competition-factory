import { replaceWithBye, assignDrawPosition } from '../../testingUtilities';
import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';

import { FEED_IN_CHAMPIONSHIP_TO_SF } from '../../../../constants/drawDefinitionConstants';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';

it('will remove BYEs fed into CONSOLATION', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FEED_IN_CHAMPIONSHIP_TO_SF,
        participantsCount: 14,
        drawSize: 16,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  let assignedByes = mainStructure.positionAssignments.filter(({ bye }) => bye);
  expect(assignedByes.length).toEqual(2);

  let consolationAssignedByes = consolationStructure.positionAssignments.filter(
    ({ bye }) => bye
  );
  expect(consolationAssignedByes.length).toEqual(2);

  // replace 2nd seed position with a bye creating a bye-progressed bye in main 2nd round
  // and propagating a bye to consolation 2nd round
  const drawPosition = 16;
  let result = replaceWithBye({
    structureId: mainStructure.structureId,
    drawPosition,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  consolationAssignedByes = consolationStructure.positionAssignments.filter(
    ({ bye }) => bye
  );
  expect(consolationAssignedByes.length).toEqual(3);

  let secondRoundConsolationByeMatchUps = consolationStructure.matchUps.filter(
    ({ matchUpStatus, roundNumber }) =>
      matchUpStatus === BYE && roundNumber === 2
  );
  expect(secondRoundConsolationByeMatchUps.length).toEqual(1);
  const targetMatchUpId = secondRoundConsolationByeMatchUps[0].matchUpId;

  // assign a participant to the original drawPosition
  result = assignDrawPosition({
    structureId: mainStructure.structureId,
    drawPosition,
    drawId,
  });

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  let targetMatchUp = consolationStructure.matchUps.find(
    ({ matchUpId }) => matchUpId === targetMatchUpId
  );
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
});
