import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { generateRange, shuffleArray } from '../../../utilities';
import tournamentEngine from '../../../tournamentEngine/sync';
import { randomInt } from '../../../utilities/math';
import mocksEngine from '../../../mocksEngine';
import fs from 'fs';
import {
  replaceWithBye,
  removeAssignment,
  assignDrawPosition,
} from '../testingUtilities';

import {
  COMPASS,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

// pseudocode...
// 1. Generate drawType of drawSize
// 2. Shuffle all drawPositions
// 3. Replace X participants in shuffled order with BYEs
// 4. Shuffle all drawPositions
// 5. Replace Y BYEs in shuffled order with Alternates
// 6. Complete all draw matchUps
// 7. All matchUps should be either byeMatchUps or completedMatchUps

it('can randomize drawPositions, randomize replacements, and complete COMPASS draw', () => {
  // successfully run with 100 iterations
  const iterations = 1;
  generateRange(0, iterations).forEach(() => {
    replacementTest({
      drawType: COMPASS,
      drawSize: 32,
    });
  });
});

it.skip('can randomize drawPositions, randomize replacements, and complete FIRST_MATCH_LOSER_CONSOLATION draw', () => {
  const iterations = 10;
  const positionActionErrorScenarios = [];
  generateRange(0, iterations).forEach(() => {
    const result = replacementTest({
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      drawSize: 16,
      devMode: true,
    });
    if (!result.success) {
      console.log('positionAction errors');
      const { tournamentRecord } = tournamentEngine.getState();
      const { drawId } = tournamentRecord.events[0].drawDefinitions[0];
      const {
        extension: positionActions,
      } = tournamentEngine.findDrawDefinitionExtension({
        drawId,
        name: 'positionActions',
      });
      positionActionErrorScenarios.push({ positionActions });
    }
  });
  if (positionActionErrorScenarios.length) {
    const fileName = `positionActions.json`;
    const dirPath = './src/global/tests/';
    const output = `${dirPath}${fileName}`;
    fs.writeFileSync(
      output,
      JSON.stringify(positionActionErrorScenarios, undefined, 1)
    );
  }
});

function replacementTest({ drawType, drawSize, participantsCount, devMode }) {
  participantsCount = participantsCount || drawSize;
  const drawProfiles = [
    {
      drawSize,
      drawType,
      participantsCount,
    },
  ];

  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  // returns the first structureId and its positionAssignments
  const { structureId, positionAssignments } = drawPositionAssignments({
    drawId,
  });

  // find all drawPositions assigned to participantIds and shuffle the array
  const participantDrawPositions = positionAssignments
    .filter(({ participantId }) => participantId)
    .map(({ drawPosition }) => drawPosition);
  const shuffledDrawPositions = shuffleArray(participantDrawPositions);

  // replace the randomized drawPositions with BYEs
  shuffledDrawPositions.forEach((drawPosition) => {
    replaceWithBye({ drawId, structureId, drawPosition });
  });

  // get the updated positionAssignments
  const {
    positionAssignments: updatedPositionAssignments,
  } = drawPositionAssignments({ drawId });

  // shuffle updated positionAssignments and slice to select random number of drawPositions to assign
  const assignmentCount = randomInt(0, participantsCount);
  const drawPositionsToAssign = shuffleArray(
    updatedPositionAssignments.map(({ drawPosition }) => drawPosition)
  ).slice(0, assignmentCount);

  // for each targeted drawPosition remove the BYE and assign participantId from availableParticipantIds
  drawPositionsToAssign.forEach((drawPosition) => {
    removeAssignment({ drawId, structureId, drawPosition });
    assignDrawPosition({ drawId, structureId, drawPosition });
  });

  // determine the total number of matchUps (only one draw is present)
  const { matchUps: allMatchUps } = tournamentEngine.allTournamentMatchUps();
  const totalMatchUpsCount = allMatchUps.length;

  // compplete all matchUps in the target draw
  completeDrawMatchUps({ tournamentEngine, drawId });

  const result = tournamentEngine.tournamentMatchUps();
  const { byeMatchUps, completedMatchUps } = result;

  if (
    devMode &&
    byeMatchUps.length + completedMatchUps.length !== totalMatchUpsCount
  ) {
    return { error: { pendingMatchUps: result.pendingMatchUps } };
  } else {
    // expect that all matchUps are either BYEs or COMPLETED
    // this is true if the combined count equals the totalMatchUpsCount
    expect(byeMatchUps.length + completedMatchUps.length).toEqual(
      totalMatchUpsCount
    );
  }

  return SUCCESS;
}

function drawPositionAssignments({ drawId }) {
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;
  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });

  return { positionAssignments, drawDefinition, structureId };
}
