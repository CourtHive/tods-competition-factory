import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import { treeMatchUps } from '../../generators/eliminationTree';
import { drawEngine } from '../../sync';

drawEngine.devContext(true);

import {
  MAIN,
  CONSOLATION,
  TOP_DOWN,
  BOTTOM_UP,
  FIRST_MATCH_LOSER_CONSOLATION,
  LOSER,
  CURTIS,
  SINGLE_ELIMINATION,
  COMPASS,
} from '../../../constants/drawDefinitionConstants';

import { ERROR } from '../../../constants/resultConstants';
import { validDrawPositions } from '../../governors/matchUpGovernor/validDrawPositions';

it('can generate main draw', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType();
  const { matchUps } = structure;
  const matchUpsCount = matchUps && matchUps.length;
  expect(matchUpsCount).toEqual(15);

  const drawPositions = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
  ];

  matchUps.forEach((matchUp, i) =>
    expect(matchUp.drawPositions).toMatchObject(drawPositions[i])
  );

  const finishingRounds = [4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 1];
  matchUps.forEach((matchUp, i) =>
    expect(matchUp.finishingRound).toEqual(finishingRounds[i])
  );

  expect(validDrawPositions({ matchUps, devContext: true })).toEqual(true);
});

it('generates main draw with expected finishing drawPositions', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType();
  const { matchUps } = structure;
  const matchesCount = matchUps && matchUps.length;
  expect(matchesCount).toEqual(15);

  const finishingPositionRanges = [
    { loser: [9, 16], winner: [1, 8] },
    { loser: [5, 8], winner: [1, 4] },
    { loser: [3, 4], winner: [1, 2] },
    { loser: [2, 2], winner: [1, 1] },
  ];

  matchUps.forEach((matchUp) => {
    const roundIndex = matchUp.roundNumber - 1;
    const expectedLoserRange = finishingPositionRanges[roundIndex].loser;
    const expectedWinnerRange = finishingPositionRanges[roundIndex].winner;
    expect(matchUp.finishingPositionRange.loser).toMatchObject(
      expectedLoserRange
    );
    expect(matchUp.finishingPositionRange.winner).toMatchObject(
      expectedWinnerRange
    );
  });
});

it('can set roundLimit and produce expected finishingRounds', () => {
  const { matchUps } = treeMatchUps({ drawSize: 16, roundLimit: 2 });
  expect(matchUps.length).toEqual(12);
  const finishingRounds = [2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1];
  matchUps.forEach((matchUp, i) =>
    expect(matchUp.finishingRound).toEqual(finishingRounds[i])
  );
});

it('can generate qualifying draw based on desired qualifyingPositions', () => {
  const { matchUps } = treeMatchUps({ drawSize: 16, qualifyingPositions: 8 });
  expect(matchUps.length).toEqual(8);
  const finishingRounds = [1, 1, 1, 1, 1, 1, 1, 1];
  matchUps.forEach((matchUp, i) =>
    expect(matchUp.finishingRound).toEqual(finishingRounds[i])
  );
});

it('can generate qualifying draw based on drawType and qualifyingPositions', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType({
    drawType: SINGLE_ELIMINATION,
    qualifyingPositions: 8,
  });
  const { matchUps } = structure;
  const matchUpsCount = matchUps && matchUps.length;
  expect(matchUpsCount).toEqual(8);
});

it('can generate qualifying draw based drawType and qualifyingRound', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType({
    drawType: SINGLE_ELIMINATION,
    qualifyingRound: 1,
  });
  const { matchUps } = structure;
  const matchUpsCount = matchUps && matchUps.length;
  expect(matchUpsCount).toEqual(8);
});

it('can generate first matchUp loser consolation', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 32 });
  const result = drawEngine.generateDrawType({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(result).not.toHaveProperty(ERROR);
  const { drawDefinition } = drawEngine.getState();
  expect(drawDefinition.links.length).toEqual(2);
  expect(drawDefinition.structures.length).toEqual(2);
  const mainDraw = drawDefinition.structures[0];
  const consolationDraw = drawDefinition.structures[1];
  expect(mainDraw.matchUps.length).toEqual(31);
  expect(consolationDraw.matchUps.length).toEqual(23);
});

it('can generate a Curtis Consolation draw', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 64 });
  drawEngine.generateDrawType({
    drawType: CURTIS,
    description: CURTIS,
  });

  const { drawDefinition: state } = drawEngine.getState();
  expect(state.structures.length).toEqual(4);
  expect(state.links.length).toEqual(5);

  const sourceRounds = [1, 2, 3, 4, 5];
  const targetRounds = [1, 2, 1, 2, 1];
  const feedProfiles = [TOP_DOWN, BOTTOM_UP, TOP_DOWN, BOTTOM_UP, TOP_DOWN];

  state.links.forEach((link, i) => {
    expect(link.linkType).toEqual(LOSER);
    expect(link.source.roundNumber).toEqual(sourceRounds[i]);
    expect(link.target.roundNumber).toEqual(targetRounds[i]);
    expect(link.target.feedProfile).toEqual(feedProfiles[i]);
  });

  const stageSequences = [1, 1, 2, 2];
  const matchUps = [63, 47, 11, 1];
  const stages = [MAIN, CONSOLATION, CONSOLATION, MAIN];

  const firstRoundFinishingPositions = [
    { winner: [1, 32], loser: [33, 64] },
    { winner: [17, 48], loser: [49, 64] },
    { winner: [5, 12], loser: [13, 16] },
    { winner: [3, 3], loser: [4, 4] },
  ];

  const finalRoundFinishingPositions = [
    { winner: [1, 1], loser: [2, 2] },
    { winner: [17, 17], loser: [18, 18] },
    { winner: [5, 5], loser: [6, 6] },
    { winner: [3, 3], loser: [4, 4] },
  ];

  state.structures.forEach((structure, i) => {
    expect(structure.stage).toEqual(stages[i]);
    expect(structure.matchUps.length).toEqual(matchUps[i]);
    expect(structure.stageSequence).toEqual(stageSequences[i]);

    const firstMatchUp = structure.matchUps[0];
    const finalMatchUp = structure.matchUps[structure.matchUps.length - 1];

    expect(firstMatchUp.finishingPositionRange.winner).toMatchObject(
      firstRoundFinishingPositions[i].winner
    );
    expect(finalMatchUp.finishingPositionRange.winner).toMatchObject(
      finalRoundFinishingPositions[i].winner
    );
    expect(firstMatchUp.finishingPositionRange.loser).toMatchObject(
      firstRoundFinishingPositions[i].loser
    );
    expect(finalMatchUp.finishingPositionRange.loser).toMatchObject(
      finalRoundFinishingPositions[i].loser
    );
  });
});

it('reasonably handles Curtis Consolation draw sizes less than 64', () => {
  const drawSizes = [32, 16, 8, 4];
  const structures = [3, 3, 2, 2, 1];
  const links = [4, 3, 1, 1, 0];

  drawSizes.forEach((dpz, i) => {
    reset();
    initialize();
    mainDrawPositions({ drawSize: drawSizes[i] });
    drawEngine.generateDrawType({ drawType: CURTIS, description: CURTIS });
    const { drawDefinition } = drawEngine.getState();
    expect(drawDefinition.structures.length).toEqual(structures[i]);
    expect(drawDefinition.links.length).toEqual(links[i]);
  });
});

it('does not generate multi-structure draws with fewer than 4 participants', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 2 });
  drawEngine.generateDrawType({ drawType: CURTIS, description: CURTIS });
  let { drawDefinition } = drawEngine.getState();
  expect(drawDefinition.structures.length).toEqual(0);
  expect(drawDefinition.links.length).toEqual(0);

  drawEngine.generateDrawType({ drawType: COMPASS, description: COMPASS });
  ({ drawDefinition } = drawEngine.getState());
  expect(drawDefinition.structures.length).toEqual(0);
  expect(drawDefinition.links.length).toEqual(0);

  drawEngine.generateDrawType({ drawType: SINGLE_ELIMINATION });
  ({ drawDefinition } = drawEngine.getState());
  expect(drawDefinition.structures.length).toEqual(1);
  expect(drawDefinition.links.length).toEqual(0);
});
