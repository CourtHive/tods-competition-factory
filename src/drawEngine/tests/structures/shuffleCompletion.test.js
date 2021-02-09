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
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  MODIFIED_FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
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
// 8. number of byeMatchUps + number of completedMatchUps should equal totalMatchUps

/*
PASSED: FEED_IN_CHAMPIONSHIP 16 * 100
PASSED: FEED_IN_CHAMPIONSHIP 32 * 100
PASSED: MODIFIED_FEED_IN_CHAMPIONSHIP 32 * 100
PASSED: CURTIS_CONSOLATION 32 * 100
PASSED: ROUND_ROBIN 32 * 100
PASSED: COMPASS 32 * 100
PASSED: COMPASS 64 * 10
PASSED: FMLC 8 * 100
PASSED: FMLC 16 * 100
PASSED: FMLC 32 * 100
PASSED: FMLC 64 * 10

*/

it('can randomize drawPositions, randomize replacements, and complete various drawTypes', () => {
  let result = replacementTest({
    drawType: COMPASS,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: CURTIS_CONSOLATION,
    drawSize: 32,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: MODIFIED_FEED_IN_CHAMPIONSHIP,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: ROUND_ROBIN,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: FEED_IN_CHAMPIONSHIP,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
});

// only to be run when stress testing
it.skip('can perform iterations of specified draw type (dev harness)', () => {
  // successfully run with 100 iterations
  const iterations = 100;
  const drawType = FEED_IN_CHAMPIONSHIP;
  const drawSize = 32;
  generateRange(0, iterations).forEach((index) => {
    const result = replacementTest({ drawType, drawSize });
    if (iterations > 1)
      console.log(`${drawType} iteration: ${index + 1}`, { result });
    expect(result.success).toEqual(true);
  });
});

// OBSOLETE: test used in development utilizing positionActions extension to identify problem areas
it.skip('can randomize drawPositions, randomize replacements, and complete drawType', () => {
  const iterations = 100;
  const positionActionErrorScenarios = [];
  const drawType = FEED_IN_CHAMPIONSHIP;
  const drawSize = 8;
  generateRange(0, iterations).forEach(() => {
    const result = replacementTest({
      drawType,
      drawSize,
      devMode: true,
    });
    if (!result.success) {
      const { tournamentRecord } = tournamentEngine.getState();
      const { drawId } = tournamentRecord.events[0].drawDefinitions[0];
      const {
        extension: positionActions,
      } = tournamentEngine.findDrawDefinitionExtension({
        drawId,
        name: 'positionActions',
      });
      positionActionErrorScenarios.push({
        positionActions,
        drawType,
        drawSize,
      });
    }
  });

  if (positionActionErrorScenarios.length) {
    console.log(`#### ERRORS ####`);
    console.log(
      `${positionActionErrorScenarios.length} of ${iterations} failed`
    );
    const fileName = `positionActions_${drawSize}_${drawType}.json`;
    const dirPath = './scratch/';
    if (fs.existsSync(dirPath)) {
      const output = `${dirPath}${fileName}`;
      fs.writeFileSync(
        output,
        JSON.stringify(positionActionErrorScenarios, undefined, 1)
      );
    }
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
    // replaceWithAlternate({ drawId, structureId, drawPosition });
    removeAssignment({ drawId, structureId, drawPosition });
    assignDrawPosition({ drawId, structureId, drawPosition });
  });

  // determine the total number of matchUps (only one draw is present)
  const { matchUps: allMatchUps } = tournamentEngine.allTournamentMatchUps();
  const totalMatchUpsCount = allMatchUps.length;

  // complete all matchUps in the target draw
  let result = completeDrawMatchUps({ tournamentEngine, drawId });
  if (result.error) return result;

  result = tournamentEngine.tournamentMatchUps();
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
