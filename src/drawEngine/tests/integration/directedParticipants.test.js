import fs from 'fs';

import { drawEngine } from '../../../drawEngine';
import { stageEntries } from '../../getters/stageGetter';
import { getDrawStructures } from '../../getters/findStructure';
import { mainDrawWithEntries } from '../../tests/primitives/primitives';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';

import { FMLC } from '../../../constants/drawDefinitionConstants';

import {
  completeMatchUp,
  verifyMatchUps,
  getMatchUpWinnerLoserIds,
  findMatchUpByRoundNumberAndPosition,
} from '../../tests/primitives/verifyMatchUps';

import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { generateFMLC } from '../../tests/primitives/fmlc';

import {
  BYE,
  RETIRED,
  COMPLETED,
  TO_BE_PLAYED,
  DEFAULTED,
  SUSPENDED,
} from '../../../constants/matchUpStatusConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MAIN,
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/drawDefinitionConstants';

it('advances paired drawPositions when BYE is assigned first', () => {
  let result;

  const stage = MAIN;
  const drawSize = 8;

  mainDrawWithEntries({ drawSize, byesCount: 2 });

  const { drawDefinition } = drawEngine.getState();
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = stageEntries({ stage, drawDefinition, entryTypes });
  const participantIds = mainDrawEntries.map(e => e.participantId);

  const { structureId } = structure;
  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });

  drawEngine.assignDrawPositionBye({
    structureId,
    drawPosition: unassignedPositions[1].drawPosition,
  });
  let { matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
  });
  expect(matchUp.drawPositions).toMatchObject([1, undefined]);
  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[0].drawPosition,
    participantId: participantIds[0],
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
  }));
  expect(matchUp.drawPositions).toMatchObject([1, undefined]);

  verifyStructure({
    structureId,
    expectedByeAssignments: 1,
    expectedPositionsAssignedCount: 2,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [3, 2],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
  });

  drawEngine.assignDrawPositionBye({
    structureId,
    drawPosition: unassignedPositions[6].drawPosition,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 2,
  }));
  expect(matchUp.drawPositions).toMatchObject([8, undefined]);
  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[7].drawPosition,
    participantId: participantIds[1],
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 2,
  }));
  expect(matchUp.drawPositions).toMatchObject([8, undefined]);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 1,
  }));
  let { matchUpId } = matchUp;
  let { errors } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
  });
  expect(errors.length).toBeGreaterThanOrEqual(1);
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 1,
  }));
  let { matchUpStatus } = matchUp;
  expect(matchUpStatus).toEqual(BYE);

  ({ errors } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: 'BOGUS',
  }));
  expect(errors.length).toBeGreaterThanOrEqual(1);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpId } = matchUp);
  ({ errors } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: 'BYE',
  }));
  expect(errors.length).toBeGreaterThanOrEqual(1);

  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[2].drawPosition,
    participantId: participantIds[2],
  });
  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[3].drawPosition,
    participantId: participantIds[3],
  });
  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[4].drawPosition,
    participantId: participantIds[4],
  });
  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[5].drawPosition,
    participantId: participantIds[5],
  });

  // add score
  let score, winningSide;
  ({ errors, matchUpId } = completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    score: '6-3 6-3',
  }));
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus, winningSide, score } = matchUp);
  expect(matchUpStatus).toEqual(COMPLETED);
  expect(winningSide).toEqual(1);
  expect(score).toEqual('6-3 6-3');

  // check that winning player was advanced
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
  }));
  const { drawPositions } = matchUp;
  expect(drawPositions).toMatchObject([1, 3]);

  drawEngine.setMatchUpStatus({ matchUpId, matchUpStatus: RETIRED });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus, score } = matchUp);
  expect(matchUpStatus).toEqual(RETIRED);
  expect(score).toEqual('6-3 6-3');

  // change winning side; score must be included when changing winning side
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    winningSide: 2,
    matchUpStatus: DEFAULTED,
  });
  expect(result).toMatchObject(SUCCESS);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus, winningSide, score } = matchUp);
  expect(matchUpStatus).toEqual(DEFAULTED);
  expect(winningSide).toEqual(2);
  expect(score).toEqual(undefined);

  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: TO_BE_PLAYED,
  });
  expect(result).toMatchObject(SUCCESS);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus, winningSide } = matchUp);
  expect(matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(winningSide).toEqual(undefined);
});

it('advances paired drawPosition if BYE is assigned second', () => {
  const stage = MAIN;
  const drawSize = 8;

  mainDrawWithEntries({ drawSize, byesCount: 2 });

  const { drawDefinition } = drawEngine.getState();
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = stageEntries({ stage, drawDefinition, entryTypes });
  const participantIds = mainDrawEntries.map(e => e.participantId);
  const [participantId1, participantId2] = participantIds;

  const { structureId } = structure;
  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });

  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[0].drawPosition,
    participantId: participantId1,
  });
  let { matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
  });
  expect(matchUp.drawPositions).toMatchObject([undefined, undefined]);
  drawEngine.assignDrawPositionBye({
    structureId,
    drawPosition: unassignedPositions[1].drawPosition,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
  }));
  expect(matchUp.drawPositions).toMatchObject([1, undefined]);

  verifyStructure({
    structureId,
    expectedByeAssignments: 1,
    expectedPositionsAssignedCount: 2,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [3, 2],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
  });

  drawEngine.assignDrawPosition({
    structureId,
    drawPosition: unassignedPositions[7].drawPosition,
    participantId: participantId2,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 2,
  }));
  expect(matchUp.drawPositions).toMatchObject([undefined, undefined]);
  drawEngine.assignDrawPositionBye({
    structureId,
    drawPosition: unassignedPositions[6].drawPosition,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 2,
  }));
  expect(matchUp.drawPositions).toMatchObject([8, undefined]);
});

it('can change a first round matchUp winner and update consolation', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 30;

  const {
    mainStructureId: structureId,
    consolationStructureId,
  } = generateFMLC({ drawSize, seedsCount, participantsCount });

  let result, errors;
  let winningParticipantId, losingParticipantId;
  let matchUp, matchUpId, matchUpStatus, sides, score, winningSide;

  ({ errors, matchUpId } = completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    score: '6-1 6-2',
  }));
  expect(errors).toEqual(undefined);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ matchUpStatus, sides, score } = matchUp);
  expect(matchUpStatus).toEqual(COMPLETED);
  expect(score).toEqual('6-1 6-2');

  let { drawDefinition } = drawEngine.getState();
  ({ winningParticipantId, losingParticipantId } = getMatchUpWinnerLoserIds({
    drawDefinition,
    matchUpId,
  }));
  const firstWinningParticipantId = winningParticipantId;

  // check that winner advanced to second round matchUp and that matchUpStatus is TO_BE_PLAYED
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
    inContext: true,
  }));
  ({ matchUpStatus, sides } = matchUp);
  expect(matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(matchUp.drawPositions).toMatchObject([1, 3]);
  expect(sides[1].participantId).toEqual(winningParticipantId);

  // check that first matchUp in consolation draw is BYE and that loser was directed
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 1,
    inContext: true,
  }));
  ({ matchUpStatus, sides } = matchUp);
  expect(matchUpStatus).toEqual(BYE);
  expect(sides[0].bye).toEqual(true);
  expect(sides[1].participantId).toEqual(losingParticipantId);

  result = drawEngine.setMatchUpStatus({
    matchUpId,
    winningSide: 2,
    matchUpStatus: DEFAULTED,
  });
  expect(result).toMatchObject(SUCCESS);

  // check that the matchUpStatus, winningSide and score changed
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ matchUpStatus, score, winningSide } = matchUp);
  expect(matchUpStatus).toEqual(DEFAULTED);
  expect(score).toEqual(undefined);
  expect(winningSide).toEqual(2);

  // check that the original loser of the matchUp is now the winner
  ({ drawDefinition } = drawEngine.getState());
  ({ winningParticipantId, losingParticipantId } = getMatchUpWinnerLoserIds({
    drawDefinition,
    matchUpId,
  }));
  expect(losingParticipantId).toEqual(firstWinningParticipantId);
  const consolationParticipantId = losingParticipantId;

  // check that second matchUp in consolation draw is TO_BE_PLAYED
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus } = matchUp);
  expect(matchUpStatus).toEqual(TO_BE_PLAYED);

  // advance main draw participant to third round
  ({ errors, matchUpId } = completeMatchUp({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: 1,
    score: '6-2 6-1',
  }));

  // attempt to complete 2nd position matchUp in first round of consolation draw
  ({ errors, matchUpId } = completeMatchUp({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    score: '6-1 1-6 6-2',
  }));
  // error because matchUp drawPositions are not assigned to participantIds
  expect(errors.length).toBeGreaterThanOrEqual(1);

  // must direct other participants to consolation draw
  ({ errors, matchUpId } = completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 3,
    winningSide: 1,
    score: '6-1 6-3',
  }));
  ({ errors, matchUpId } = completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 4,
    winningSide: 1,
    score: '6-1 6-4',
  }));

  // complete 2nd position matchUp in first round of consolation draw
  ({ errors, matchUpId } = completeMatchUp({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    score: '6-1 1-6 6-2',
  }));

  // advance 1st position matchUp in second round of consolation draw
  ({ errors, matchUpId } = completeMatchUp({
    structureId: consolationStructureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: 1,
    score: '6-2 1-6 6-1',
  }));
  ({ drawDefinition } = drawEngine.getState());
  ({ winningParticipantId, losingParticipantId } = getMatchUpWinnerLoserIds({
    drawDefinition,
    matchUpId,
  }));
  expect(winningParticipantId).toEqual(consolationParticipantId);

  // Now attempt to change a 1st round matchUpStatus to BYE
  ({
    matchUp: { matchUpId },
  } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ errors } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: BYE,
    score: '6-1',
  }));
  expect(errors.length).toBeGreaterThanOrEqual(1);

  // Now attempt to change a 1st round matchUpStatus to TO_BE_PLAYED
  ({
    matchUp: { matchUpId },
  } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ errors } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: TO_BE_PLAYED,
  }));
  expect(errors.length).toBeGreaterThanOrEqual(1);

  // Now attempt to change a 1st round matchUpStatus, but not winner...
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
    score: '6-1',
  });
  expect(result).toMatchObject(SUCCESS);

  // Now attempt to change a 1st round matchUpStatus, but not winner...
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
    winningSide: 2,
    score: '6-1',
  });
  expect(result).toMatchObject(SUCCESS);

  // Now attempt to change a 1st round matchUpStatus to nonDirecting outcome, same winningSide...
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: SUSPENDED,
    winningSide: 2,
    score: '6-1',
  });
  expect(errors.length).toBeGreaterThanOrEqual(1);

  // Now attempt a change which has no available actions...
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    winningSide: 2,
    score: '6-1',
  });
  expect(errors.length).toBeGreaterThanOrEqual(1);

  // Now attempt to change a 1st round matchUp outcome, including winner...
  ({ errors } = drawEngine.setMatchUpStatus({
    matchUpId,
    winningSide: 1,
    matchUpStatus: COMPLETED,
    score: '6-0 6-0',
  }));
  expect(errors.length).toBeGreaterThanOrEqual(1);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ matchUpStatus, score, winningSide } = matchUp);
  expect(matchUpStatus).toEqual(RETIRED);
  expect(score).toEqual('6-1');
  expect(winningSide).toEqual(2);
});

it('can write to the file system', () => {
  const writeFile = process.env.TMX_TEST_FILES;

  const drawType = FMLC;
  const { drawDefinition } = drawEngine.getState();
  const fileName = `${drawType}.json`;
  const dirPath = './src/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(drawDefinition, null, 2));
});
