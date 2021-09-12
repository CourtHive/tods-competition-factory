import { parseScoreString } from '../../../mocksEngine/utilities/parseScoreString';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { generateFMLC } from '../primitives/firstMatchLoserConsolation';
import { mainDrawWithEntries } from '../../tests/primitives/primitives';
import { getDrawStructures } from '../../getters/findStructure';
import { getStageEntries } from '../../getters/stageGetter';
import { drawEngine } from '../../sync';
import {
  completeMatchUp,
  verifyMatchUps,
  getMatchUpWinnerLoserIds,
  findMatchUpByRoundNumberAndPosition,
} from '../../tests/primitives/verifyMatchUps';

import { CANNOT_CHANGE_WINNINGSIDE } from '../../../constants/errorConditionConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  RETIRED,
  COMPLETED,
  TO_BE_PLAYED,
  DEFAULTED,
  SUSPENDED,
} from '../../../constants/matchUpStatusConstants';

import {
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/entryStatusConstants';

it('advances paired drawPositions when BYE is assigned first', () => {
  let result;

  const stage = MAIN;
  const drawSize = 8;

  mainDrawWithEntries({ drawSize, byesCount: 2 });

  let { drawDefinition } = drawEngine.getState();
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = getStageEntries({
    stage,
    drawDefinition,
    entryTypes,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);

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

  ({ drawDefinition } = drawEngine.getState());

  verifyStructure({
    structureId,
    drawDefinition,
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
  let { error } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
  });
  expect(error).not.toBeUndefined();

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 1,
  }));
  let { matchUpStatus } = matchUp;
  expect(matchUpStatus).toEqual(BYE);

  ({ error } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: 'BOGUS',
  }));
  expect(error).not.toBeUndefined();

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpId } = matchUp);
  ({ error } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: 'BYE',
  }));
  expect(error).not.toBeUndefined();

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
  ({ error, matchUpId } = completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    scoreString: '6-3 6-3',
  }));
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus, winningSide, score } = matchUp);
  expect(matchUpStatus).toEqual(COMPLETED);
  expect(winningSide).toEqual(1);
  const sets = parseScoreString({ scoreString: '6-3 6-3' });
  expect(score?.sets).toEqual(sets);

  // check that winning player was advanced
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
  }));
  const { drawPositions } = matchUp;
  expect(drawPositions).toMatchObject([1, 3]);

  drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus, score } = matchUp);
  expect(matchUpStatus).toEqual(RETIRED);
  expect(score?.sets).toEqual(sets);

  // change winning side; score must be included when changing winning side
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    winningSide: 2,
    matchUpStatus: DEFAULTED,
  });
  expect(result.success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus, winningSide, score } = matchUp);
  expect(matchUpStatus).toEqual(DEFAULTED);
  expect(winningSide).toEqual(2);

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

  let { drawDefinition } = drawEngine.getState();
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const mainDrawEntries = getStageEntries({
    stage,
    drawDefinition,
    entryTypes,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);
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
  expect(matchUp.drawPositions.filter(Boolean)).toMatchObject([]);
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

  ({ drawDefinition } = drawEngine.getState());
  verifyStructure({
    structureId,
    drawDefinition,
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
  expect(matchUp.drawPositions.filter(Boolean)).toMatchObject([]);
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

it('can change a FMLC first round matchUp winner and update consolation', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 30;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  let result, error, success, drawPositions;
  let winningParticipantId, losingParticipantId;
  let matchUp, matchUpId, matchUpStatus, sides, score, winningSide;

  // complete the 2nd position matchUp, between drawPositions: [3, 4]; 3 advances;
  ({ matchUp, success, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    scoreString: '6-1 6-2',
  }));
  expect(success).toEqual(true);

  let { drawDefinition } = drawEngine.getState();

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ drawPositions, matchUpStatus, sides, score } = matchUp);
  expect(matchUpStatus).toEqual(COMPLETED);
  expect(drawPositions).toEqual([3, 4]);
  const sets = parseScoreString({ scoreString: '6-1 6-2' });
  expect(score?.sets).toEqual(sets);

  ({ drawDefinition } = drawEngine.getState());
  ({ winningParticipantId, losingParticipantId } = getMatchUpWinnerLoserIds({
    drawDefinition,
    matchUpId,
  }));
  // const firstWinningParticipantId = winningParticipantId;

  // check that winner advanced to second round matchUp and that matchUpStatus is TO_BE_PLAYED
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
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
  expect(sides[1].participantId).toEqual(losingParticipantId);

  // check that second matchUp in consolation draw is TO_BE_PLAYED
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  ({ matchUpStatus } = matchUp);
  expect(matchUpStatus).toEqual(TO_BE_PLAYED);

  // advance main draw participant in drawPosition: 1 to third round
  ({ matchUp, success, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: 1,
    score: '6-2 6-1',
  }));
  expect(success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 2,
    roundPosition: 1,
  }));
  expect(matchUp.drawPositions).toEqual([1, 3]);

  // attempt to complete 2nd position matchUp in first round of consolation draw
  result = completeMatchUp({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    score: '6-1 1-6 6-2',
  });
  ({ error, success, matchUpId } = result);
  expect(success).toEqual(undefined);
  // error because matchUp drawPositions are not assigned to participantIds
  expect(error).not.toBeUndefined();

  // complete matchUp between drawPositions: [5, 6] in mainStructure
  // ...to direct other participants to consolation draw
  ({ matchUp, success, error, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 3,
    winningSide: 1,
    score: '6-1 6-3',
  }));
  expect(success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 3,
  }));
  expect(matchUp.drawPositions).toEqual([5, 6]);

  ({ matchUp, success, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 4,
    winningSide: 1,
    score: '6-1 6-4',
  }));
  expect(success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 4,
  }));
  expect(matchUp.drawPositions).toEqual([7, 8]);

  // complete 2nd position matchUp in first round of consolation draw
  ({ matchUp, success, matchUpId } = completeMatchUp({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    score: '6-1 1-6 6-2',
  }));
  expect(success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: consolationStructureId,
    roundNumber: 1,
    roundPosition: 2,
  }));
  expect(matchUp.drawPositions).toEqual([11, 12]);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: consolationStructureId,
    roundNumber: 3,
    roundPosition: 1,
    inContext: true,
  }));
  ({ matchUpStatus, sides } = matchUp);
  // { drawPosition: 10 } is bye- advanced to the third round
  expect(sides[0].drawPosition).toEqual(10);

  // Now attempt to change a 1st round matchUpStatus to BYE
  ({
    matchUp: { matchUpId },
  } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ error } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: BYE,
    score: '6-1',
  }));
  expect(error).not.toBeUndefined();

  // Now attempt to change a 1st round matchUpStatus to TO_BE_PLAYED
  ({
    matchUp: { matchUpId },
  } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));

  ({ error } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: TO_BE_PLAYED,
  }));
  expect(error).not.toBeUndefined();

  // Now attempt to change a 1st round matchUpStatus, but not winner...
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
    score: '6-1',
  });
  expect(result).toMatchObject(SUCCESS);

  // Now attempt to change a 1st round matchUpStatus to nonDirecting outcome, same winningSide...
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: SUSPENDED,
    winningSide: 1,
    score: '6-1',
  });
  expect(result.error).not.toBeUndefined();

  // Now attempt to change a 1st round matchUp outcome, including winner...
  // when { allowChangePropagation: false }
  ({ error } = drawEngine.setMatchUpStatus({
    matchUpId,
    winningSide: 2,
    matchUpStatus: COMPLETED,
    score: '6-0 6-0',
    allowChangePropagation: false,
  }));
  expect(error).toEqual(CANNOT_CHANGE_WINNINGSIDE);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ matchUpStatus, score, winningSide } = matchUp);
  expect(matchUpStatus).toEqual(RETIRED);
  expect(score).toEqual('6-1');
  expect(winningSide).toEqual(1);
});
