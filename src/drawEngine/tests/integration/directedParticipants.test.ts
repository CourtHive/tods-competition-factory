import { parseScoreString } from '../../../mocksEngine/utilities/parseScoreString';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { verifyStructure } from '../primitives/verifyStructure';
import { generateFMLC } from '../primitives/firstMatchLoserConsolation';
import { getDrawStructures } from '../../getters/findStructure';
import { getStageEntries } from '../../getters/stageGetter';
import { drawEngine } from '../../sync';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';
import {
  completeMatchUp,
  verifyMatchUps,
  getMatchUpWinnerLoserIds,
  findMatchUpByRoundNumberAndPosition,
} from '../primitives/verifyMatchUps';

import { MAIN } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  CANNOT_CHANGE_WINNING_SIDE,
  INCOMPATIBLE_MATCHUP_STATUS,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  RETIRED,
  COMPLETED,
  TO_BE_PLAYED,
  DEFAULTED,
  SUSPENDED,
} from '../../../constants/matchUpStatusConstants';
import { EntryStatusEnum, StageTypeEnum } from '../../../types/tournamentTypes';

it('advances paired drawPositions when BYE is assigned first', () => {
  let result;

  const stage: StageTypeEnum = StageTypeEnum.Main;
  const drawSize = 8;

  let { drawDefinition } = mocksEngine.generateEventWithDraw({
    drawProfile: {
      participantsCount: drawSize - 2,
      automated: false,
      drawSize,
    },
  });

  drawEngine.setState(drawDefinition);

  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryStatuses = [
    EntryStatusEnum.DirectAcceptance,
    EntryStatusEnum.Wildcard,
  ];
  const mainDrawEntries = getStageEntries({
    drawDefinition,
    entryStatuses,
    stage,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);

  const { structureId } = structure;
  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });

  result = drawEngine.assignDrawPositionBye({
    drawPosition: unassignedPositions?.[1].drawPosition,
    structureId,
  });
  expect(result.success).toEqual(true);

  let { matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 1,
    roundNumber: 2,
    structureId,
  });
  expect(matchUp.drawPositions).toMatchObject([1, undefined]);
  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[0].drawPosition,
    participantId: participantIds[0],
    structureId,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 1,
    roundNumber: 2,
    structureId,
  }));
  expect(matchUp.drawPositions).toMatchObject([1, undefined]);

  ({ drawDefinition } = drawEngine.getState());

  verifyStructure({
    expectedPositionsAssignedCount: 2,
    expectedByeAssignments: 1,
    drawDefinition,
    structureId,
  });

  verifyMatchUps({
    expectedRoundCompleted: [0, 0],
    expectedRoundUpcoming: [0, 0],
    expectedRoundPending: [3, 2],
    structureId,
  });

  drawEngine.assignDrawPositionBye({
    drawPosition: unassignedPositions?.[6].drawPosition,
    structureId,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 2,
    roundNumber: 2,
    structureId,
  }));
  expect(matchUp.drawPositions).toMatchObject([8, undefined]);
  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[7].drawPosition,
    participantId: participantIds[1],
    structureId,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 2,
    roundNumber: 2,
    structureId,
  }));
  expect(matchUp.drawPositions).toMatchObject([8, undefined]);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 1,
    roundNumber: 1,
    structureId,
  }));
  let { matchUpId } = matchUp;
  let { error } = drawEngine.setMatchUpStatus({
    matchUpStatus: RETIRED,
    matchUpId,
  });
  expect(error).not.toBeUndefined();

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 1,
    roundNumber: 1,
    structureId,
  }));
  let { matchUpStatus } = matchUp;
  expect(matchUpStatus).toEqual(BYE);

  ({ error } = drawEngine.setMatchUpStatus({
    matchUpStatus: 'BOGUS',
    matchUpId,
  }));
  expect(error).not.toBeUndefined();

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 2,
    roundNumber: 1,
    structureId,
  }));
  ({ matchUpId } = matchUp);
  ({ error } = drawEngine.setMatchUpStatus({
    matchUpStatus: 'BYE',
    matchUpId,
  }));
  expect(error).not.toBeUndefined();

  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[2].drawPosition,
    participantId: participantIds[2],
    structureId,
  });
  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[3].drawPosition,
    participantId: participantIds[3],
    structureId,
  });
  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[4].drawPosition,
    participantId: participantIds[4],
    structureId,
  });
  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[5].drawPosition,
    participantId: participantIds[5],
    structureId,
  });

  // add score
  let score, winningSide;
  ({ error, matchUpId } = completeMatchUp({
    scoreString: '6-3 6-3',
    roundPosition: 2,
    roundNumber: 1,
    winningSide: 1,
    structureId,
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
    roundPosition: 1,
    roundNumber: 2,
    structureId,
  }));
  const { drawPositions } = matchUp;
  expect(drawPositions).toMatchObject([1, 3]);

  drawEngine.setMatchUpStatus({
    matchUpStatus: RETIRED,
    matchUpId,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 2,
    roundNumber: 1,
    structureId,
  }));
  ({ matchUpStatus, score } = matchUp);
  expect(matchUpStatus).toEqual(RETIRED);
  expect(score?.sets).toEqual(sets);

  // change winning side; score must be included when changing winning side
  result = drawEngine.setMatchUpStatus({
    matchUpStatus: DEFAULTED,
    winningSide: 2,
    matchUpId,
  });
  expect(result.success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 2,
    roundNumber: 1,
    structureId,
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
    roundPosition: 2,
    roundNumber: 1,
    structureId,
  }));
  ({ matchUpStatus, winningSide } = matchUp);
  expect(matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(winningSide).toEqual(undefined);
});

it('advances paired drawPosition if BYE is assigned second', () => {
  const stage = MAIN;
  const drawSize = 8;

  let { drawDefinition } = mocksEngine.generateEventWithDraw({
    drawProfile: {
      participantsCount: drawSize - 2,
      automated: false,
      drawSize,
    },
  });
  drawEngine.setState(drawDefinition);

  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage });

  const entryStatuses = [
    EntryStatusEnum.DirectAcceptance,
    EntryStatusEnum.Wildcard,
  ];
  const mainDrawEntries = getStageEntries({
    drawDefinition,
    entryStatuses,
    stage,
  });
  const participantIds = mainDrawEntries.map((e) => e.participantId);
  const [participantId1, participantId2] = participantIds;

  const { structureId } = structure;
  const { unassignedPositions } = structureAssignedDrawPositions({
    drawDefinition,
    structureId,
  });

  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[0].drawPosition,
    participantId: participantId1,
    structureId,
  });
  let { matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
  });
  expect(matchUp.drawPositions.filter(Boolean)).toMatchObject([]);
  drawEngine.assignDrawPositionBye({
    drawPosition: unassignedPositions?.[1].drawPosition,
    structureId,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 1,
    roundNumber: 2,
    structureId,
  }));
  expect(matchUp.drawPositions).toMatchObject([1, undefined]);

  ({ drawDefinition } = drawEngine.getState());
  verifyStructure({
    expectedPositionsAssignedCount: 2,
    expectedByeAssignments: 1,
    drawDefinition,
    structureId,
  });

  verifyMatchUps({
    expectedRoundCompleted: [0, 0],
    expectedRoundUpcoming: [0, 0],
    expectedRoundPending: [3, 2],
    structureId,
  });

  drawEngine.assignDrawPosition({
    drawPosition: unassignedPositions?.[7].drawPosition,
    participantId: participantId2,
    structureId,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 2,
    roundNumber: 2,
    structureId,
  }));
  expect(matchUp.drawPositions.filter(Boolean)).toMatchObject([]);
  drawEngine.assignDrawPositionBye({
    drawPosition: unassignedPositions?.[6].drawPosition,
    structureId,
  });
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition: 2,
    roundNumber: 2,
    structureId,
  }));
  expect(matchUp.drawPositions).toMatchObject([8, undefined]);
});

it('can change a FMLC first round matchUp winner and update consolation', () => {
  const participantsCount = 30;
  const seedsCount = 8;
  const drawSize = 32;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    participantsCount,
    seedsCount,
    drawSize,
  });

  let result, error, success;
  let matchUp, matchUpId, matchUpStatus, sides, score;

  // complete the 2nd position matchUp, between drawPositions: [3, 4]; 3 advances;
  ({ matchUp, success, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    scoreString: '6-1 6-2',
    roundPosition: 2,
    winningSide: 1,
    roundNumber: 1,
  }));
  expect(success).toEqual(true);

  let { drawDefinition } = drawEngine.getState();

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundPosition: 2,
    inContext: true,
    roundNumber: 1,
  }));
  ({ matchUpStatus, sides, score } = matchUp);
  expect(matchUpStatus).toEqual(COMPLETED);
  expect(matchUp.drawPositions).toEqual([3, 4]);
  const sets = parseScoreString({ scoreString: '6-1 6-2' });
  expect(score?.sets).toEqual(sets);

  ({ drawDefinition } = drawEngine.getState());
  const { winningParticipantId, losingParticipantId } =
    getMatchUpWinnerLoserIds({
      drawDefinition,
      matchUpId,
    });

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
    roundPosition: 1,
    inContext: true,
    roundNumber: 1,
  }));
  ({ matchUpStatus, sides } = matchUp);
  expect(sides[1].participantId).toEqual(losingParticipantId);

  // check that second matchUp in consolation draw is TO_BE_PLAYED
  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: consolationStructureId,
    roundPosition: 2,
    roundNumber: 1,
  }));
  ({ matchUpStatus } = matchUp);
  expect(matchUpStatus).toEqual(TO_BE_PLAYED);

  // advance main draw participant in drawPosition: 1 to third round
  ({ matchUp, success, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    scoreString: '6-2 6-1',
    roundPosition: 1,
    roundNumber: 2,
    winningSide: 1,
  }));
  expect(success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundPosition: 1,
    roundNumber: 2,
  }));
  expect(matchUp.drawPositions).toEqual([1, 3]);

  // attempt to complete 2nd position matchUp in first round of consolation draw
  result = completeMatchUp({
    structureId: consolationStructureId,
    scoreString: '6-1 1-6 6-2',
    roundPosition: 2,
    roundNumber: 1,
    winningSide: 1,
  });
  ({ error, success, matchUpId } = result);
  expect(success).toEqual(undefined);
  // error because matchUp drawPositions are not assigned to participantIds
  expect(error).not.toBeUndefined();

  // complete matchUp between drawPositions: [5, 6] in mainStructure
  // ...to direct other participants to consolation draw
  ({ matchUp, success, error, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    scoreString: '6-1 6-3',
    roundPosition: 3,
    roundNumber: 1,
    winningSide: 1,
  }));
  expect(success).toEqual(true);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundPosition: 3,
    roundNumber: 1,
  }));
  expect(matchUp.drawPositions).toEqual([5, 6]);

  ({ matchUp, success, matchUpId } = completeMatchUp({
    structureId: mainStructureId,
    scoreString: '6-1 6-4',
    roundPosition: 4,
    roundNumber: 1,
    winningSide: 1,
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
    scoreString: '6-1 1-6 6-2',
    roundPosition: 2,
    roundNumber: 1,
    winningSide: 1,
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
  expect(result.error).toEqual(INVALID_VALUES);
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
  });
  expect(result.success).toEqual(true);

  // Now attempt to change a 1st round matchUpStatus to nonDirecting outcome, same winningSide...
  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: SUSPENDED,
    winningSide: 1,
  });
  expect(result.error).toEqual(INCOMPATIBLE_MATCHUP_STATUS);

  // Now attempt to change a 1st round matchUp outcome, including winner...
  // when { allowChangePropagation: false }
  ({ error } = drawEngine.setMatchUpStatus({
    matchUpId,
    winningSide: 2,
    matchUpStatus: COMPLETED,
    allowChangePropagation: false,
  }));
  expect(error).toEqual(CANNOT_CHANGE_WINNING_SIDE);

  ({ matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    inContext: true,
  }));
  ({ matchUpStatus, score } = matchUp);
  expect(matchUpStatus).toEqual(RETIRED);
  expect(matchUp.winningSide).toEqual(1);
});
