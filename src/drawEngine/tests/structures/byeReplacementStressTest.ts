import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getDrawPosition } from '../../../global/functions/extractors';
import { findEvent } from '../../../acquire/findEvent';
import { extractAttributes, shuffleArray } from '../../../utilities';
import { hasParticipantId } from '../../../global/functions/filters';
import tournamentEngine from '../../../tournamentEngine/sync';
import { randomInt } from '../../../utilities/math';
import mocksEngine from '../../../mocksEngine';
import { expect } from 'vitest';
import {
  replaceWithBye,
  removeAssignment,
  assignDrawPosition,
} from '../testingUtilities';

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

export function replacementTest(params) {
  let { positionsToReplaceWithBye, participantsCount, byeLimit } = params;
  const { drawType, drawSize, devMode } = params;
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
    ?.filter(hasParticipantId)
    .map(getDrawPosition);
  const shuffledDrawPositions = shuffleArray(participantDrawPositions);

  // if no byeLimit or positionsToReplaceWithBye array is provided, replace all positions with BYEs
  byeLimit = byeLimit || positionsToReplaceWithBye?.length;
  const replacementCount = byeLimit || shuffledDrawPositions.length;

  positionsToReplaceWithBye =
    positionsToReplaceWithBye ||
    shuffledDrawPositions.slice(0, replacementCount);

  // replace subset of randomized drawPositions with BYEs
  positionsToReplaceWithBye.forEach((drawPosition) => {
    replaceWithBye({ drawId, structureId, drawPosition });
  });

  if (!byeLimit) {
    // get the updated positionAssignments
    const { positionAssignments: updatedPositionAssignments } =
      drawPositionAssignments({ drawId });

    // shuffle updated positionAssignments and slice to select random number of drawPositions to assign
    const assignmentCount = randomInt(0, participantsCount);
    const drawPositionsToAssign = shuffleArray(
      updatedPositionAssignments?.map(extractAttributes('drawPosition')) ?? []
    ).slice(0, assignmentCount);

    // for each targeted drawPosition remove the BYE and assign participantId from availableParticipantIds
    drawPositionsToAssign.forEach((drawPosition) => {
      removeAssignment({ drawId, structureId, drawPosition });
      assignDrawPosition({ drawId, structureId, drawPosition });
    });
  }

  // determine the total number of matchUps (only one draw is present)
  const { matchUps: allMatchUps } = tournamentEngine.allTournamentMatchUps();
  const totalMatchUpsCount = allMatchUps.length;

  // complete all matchUps in the target draw
  const { tournamentRecord: updatedTournamentRecord } =
    tournamentEngine.getState();
  const { drawDefinition } = findEvent({
    tournamentRecord: updatedTournamentRecord,
    drawId,
  });
  completeDrawMatchUps({ drawDefinition });
  tournamentEngine.setState(updatedTournamentRecord);

  const result = tournamentEngine.tournamentMatchUps();
  const { byeMatchUps, completedMatchUps } = result;

  if (devMode) {
    // expect that all matchUps are either BYEs or COMPLETED
    // this is true if the combined count equals the totalMatchUpsCount
    expect(byeMatchUps.length + completedMatchUps.length).toEqual(
      totalMatchUpsCount
    );
  }

  return { ...SUCCESS };
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
