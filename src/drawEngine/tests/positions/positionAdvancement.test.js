import { getDrawStructures } from '../../getters/findStructure';
import {
  getAllDrawMatchUps,
  getStructureMatchUps,
} from '../../getters/getMatchUps';
import { feedInChampionship } from '../../tests/primitives/feedIn';
import { positionTargets } from '../../governors/positionGovernor/positionTargets';
import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../tests/primitives/primitives';
import { drawEngine } from '../../../drawEngine';

import {
  MAIN,
  FEED_IN_CHAMPIONSHIP,
  FMLC,
  COMPASS,
} from '../../../constants/drawDefinitionConstants';

import { ERROR } from '../../../constants/resultConstants';

it('can direct participants in First Match Consolation (FMLC)', () => {
  reset();
  initialize();
  const drawSize = 32;
  mainDrawPositions({ drawSize });
  const result = drawEngine.generateDrawType({ drawType: FMLC });
  expect(result).not.toHaveProperty(ERROR);
  const { drawDefinition } = drawEngine.getState();
  expect(drawDefinition.links.length).toEqual(2);
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });

  // not requiring participants, just checking round Positions
  const { upcomingMatchUps, pendingMatchUps } = getStructureMatchUps({
    structure,
    requireParticipants: false,
  });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,
  });

  // test first matchUp in roundNumber: 1
  let matchUpId = upcomingMatchUps.reduce((matchUpId, matchUp) => {
    return matchUp.roundNumber === 1 && matchUp.roundPosition === 1
      ? matchUp.matchUpId
      : matchUpId;
  }, undefined);

  let {
    matchUp,
    targetMatchUps: { winnerMatchUp, loserMatchUp },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  });

  expect(matchUp.roundNumber).toEqual(1);
  expect(matchUp.roundPosition).toEqual(1);
  expect(winnerMatchUp.roundNumber).toEqual(2);
  expect(winnerMatchUp.roundPosition).toEqual(1);
  expect(loserMatchUp.roundNumber).toEqual(1);
  expect(loserMatchUp.roundPosition).toEqual(1);

  expect(matchUp.structureId).toEqual(winnerMatchUp.structureId);
  expect(matchUp.structureId).not.toEqual(loserMatchUp.structureId);

  // test last matchUp in roundNumber: 1
  matchUpId = upcomingMatchUps.reduce((matchUpId, matchUp) => {
    return matchUp.roundNumber === 1 && matchUp.roundPosition === drawSize / 2
      ? matchUp.matchUpId
      : matchUpId;
  }, undefined);

  ({
    matchUp,
    targetMatchUps: { winnerMatchUp, loserMatchUp },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  }));

  expect(matchUp.roundNumber).toEqual(1);
  expect(matchUp.roundPosition).toEqual(drawSize / 2);
  expect(winnerMatchUp.roundNumber).toEqual(2);
  expect(winnerMatchUp.roundPosition).toEqual(drawSize / 4);
  expect(loserMatchUp.roundNumber).toEqual(1);
  expect(loserMatchUp.roundPosition).toEqual(drawSize / 4);

  expect(matchUp.structureId).toEqual(winnerMatchUp.structureId);
  expect(matchUp.structureId).not.toEqual(loserMatchUp.structureId);

  ({ matchUpId } = pendingMatchUps[0]);
  const {
    matchUp: matchUp2ndRound,
    targetMatchUps: {
      winnerMatchUp: winnerMatchUp2ndRound,
      loserMatchUp: loserMatchUp2ndRound,
    },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  });

  expect(matchUp2ndRound.roundNumber).toEqual(2);
  expect(winnerMatchUp2ndRound.roundNumber).toEqual(3);

  expect(matchUp2ndRound.structureId).toEqual(
    winnerMatchUp2ndRound.structureId
  );
  expect(loserMatchUp2ndRound.roundNumber).toEqual(1);
  expect(loserMatchUp2ndRound.roundPosition).toEqual(1);
});

it('can direct participants in FEED_IN_CHAMPIONSHIP structure', () => {
  const drawSize = 16;
  feedInChampionship({
    drawSize,
    drawType: FEED_IN_CHAMPIONSHIP,
    feedPolicy: { roundGroupedOrder: [] },
  });
  const { drawDefinition } = drawEngine.getState();
  expect(drawDefinition.links.length).toEqual(4);
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });

  // not requiring participants for this round of testing
  const { upcomingMatchUps, pendingMatchUps } = getStructureMatchUps({
    structure,
    requireParticipants: false,
  });
  expect(upcomingMatchUps.length).toEqual(drawSize / 2);

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,
  });

  // test first matchUp in roundNumber: 1
  let matchUpId = upcomingMatchUps.reduce((matchUpId, matchUp) => {
    return matchUp.roundNumber === 1 && matchUp.roundPosition === 1
      ? matchUp.matchUpId
      : matchUpId;
  }, undefined);

  let {
    matchUp,
    targetMatchUps: { winnerMatchUp, loserMatchUp },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  });

  expect(matchUp.structureId).toEqual(winnerMatchUp.structureId);
  expect(matchUp.structureId).not.toEqual(loserMatchUp.structureId);

  expect(matchUp.roundNumber).toEqual(1);
  expect(winnerMatchUp.roundNumber).toEqual(2);
  expect(loserMatchUp.roundNumber).toEqual(1);

  expect(matchUp.roundPosition).toEqual(1);
  expect(winnerMatchUp.roundPosition).toEqual(1);
  expect(loserMatchUp.roundPosition).toEqual(1);

  // test last matchUp in roundNumber: 1
  matchUpId = upcomingMatchUps.reduce((matchUpId, matchUp) => {
    return matchUp.roundNumber === 1 && matchUp.roundPosition === drawSize / 2
      ? matchUp.matchUpId
      : matchUpId;
  }, undefined);

  ({
    matchUp,
    targetMatchUps: { winnerMatchUp, loserMatchUp },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  }));

  expect(matchUp.structureId).toEqual(winnerMatchUp.structureId);
  expect(matchUp.structureId).not.toEqual(loserMatchUp.structureId);

  expect(matchUp.roundNumber).toEqual(1);
  expect(winnerMatchUp.roundNumber).toEqual(2);
  expect(loserMatchUp.roundNumber).toEqual(1);

  expect(matchUp.roundPosition).toEqual(drawSize / 2);
  expect(winnerMatchUp.roundPosition).toEqual(drawSize / 4);
  expect(loserMatchUp.roundPosition).toEqual(drawSize / 4);

  ({ matchUpId } = pendingMatchUps[0]);
  const {
    matchUp: matchUp2ndRound,
    targetMatchUps: {
      winnerMatchUp: winnerMatchUp2ndRound,
      loserMatchUp: loserMatchUp2ndRound,
    },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  });

  expect(matchUp2ndRound.roundNumber).toEqual(2);
  expect(winnerMatchUp2ndRound.roundNumber).toEqual(3);
  expect(loserMatchUp2ndRound.roundNumber).toEqual(2);

  expect(matchUp2ndRound.roundPosition).toEqual(1);
  expect(winnerMatchUp2ndRound.roundPosition).toEqual(1);
  // 2nd round should be fed BOTTOM_UP
  expect(loserMatchUp2ndRound.roundPosition).toEqual(4);

  expect(matchUp2ndRound.structureId).toEqual(
    winnerMatchUp2ndRound.structureId
  );
  expect(matchUp2ndRound.structureId).not.toEqual(
    loserMatchUp2ndRound.structureId
  );
  expect(matchUp2ndRound.structureId).not.toEqual(
    loserMatchUp2ndRound.structureId
  );

  expect(loserMatchUp.structureId).toEqual(loserMatchUp2ndRound.structureId);
});

it('can direct participants in COMPASS', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 32 });
  const result = drawEngine.generateDrawType({ drawType: COMPASS });
  expect(result).not.toHaveProperty(ERROR);
  const { drawDefinition } = drawEngine.getState();
  expect(drawDefinition.links.length).toEqual(7);
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });

  // not requiring participants, just checking round Positions
  const { upcomingMatchUps, pendingMatchUps } = getStructureMatchUps({
    structure,
    requireParticipants: false,
  });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,
  });

  let { matchUpId } = upcomingMatchUps[0];
  const {
    matchUp,
    targetLinks: { loserTargetLink },
    targetMatchUps: { winnerMatchUp, loserMatchUp },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  });

  expect(matchUp.roundNumber).toEqual(1);
  expect(winnerMatchUp.roundNumber).toEqual(2);
  expect(loserMatchUp.roundNumber).toEqual(1);

  expect(matchUp.roundPosition).toEqual(1);
  expect(winnerMatchUp.roundPosition).toEqual(1);
  expect(loserMatchUp.roundPosition).toEqual(1);

  expect(loserTargetLink.source.structureName).toEqual('EAST');
  expect(loserTargetLink.target.structureName).toEqual('WEST');

  expect(matchUp.structureId).toEqual(winnerMatchUp.structureId);
  expect(matchUp.structureId).not.toEqual(loserMatchUp.structureId);

  ({ matchUpId } = pendingMatchUps[0]);
  const {
    matchUp: matchUp2ndRound,
    targetLinks: { loserTargetLink: round2loserTargetLink },
    targetMatchUps: {
      winnerMatchUp: winnerMatchUp2ndRound,
      loserMatchUp: loserMatchUp2ndRound,
    },
  } = positionTargets({
    drawDefinition,
    inContextDrawMatchUps,
    structure,
    matchUpId,
  });

  expect(matchUp2ndRound.roundNumber).toEqual(2);
  expect(winnerMatchUp2ndRound.roundNumber).toEqual(3);
  expect(loserMatchUp2ndRound.roundNumber).toEqual(1);

  expect(matchUp.roundPosition).toEqual(1);
  expect(winnerMatchUp.roundPosition).toEqual(1);
  expect(loserMatchUp.roundPosition).toEqual(1);

  expect(round2loserTargetLink.source.structureName).toEqual('EAST');
  expect(round2loserTargetLink.target.structureName).toEqual('NORTH');

  expect(matchUp2ndRound.structureId).toEqual(
    winnerMatchUp2ndRound.structureId
  );
  expect(matchUp2ndRound.structureId).not.toEqual(
    loserMatchUp2ndRound.structureId
  );
  expect(loserMatchUp.structureId).not.toEqual(
    loserMatchUp2ndRound.structureId
  );
});
