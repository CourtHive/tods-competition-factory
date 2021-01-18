import { generateRange } from '../../../utilities';
import { drawEngine } from '../../../drawEngine';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor';
import { feedInMatchUps } from '../../generators/eliminationTree';
import { feedInChampionship } from '../../tests/primitives/feedIn';
import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../tests/primitives/primitives';

import {
  TOP_DOWN,
  BOTTOM_UP,
  MFIC,
  LOSER,
  FEED_IN,
  FEED_IN_CHAMPIONSHIP,
  FICR16,
  FICSF,
} from '../../../constants/drawDefinitionConstants';

it('can generate structured entry draw', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 31 });
  const { structure } = drawEngine
    .devContext(true)
    .generateDrawType({ drawType: FEED_IN });
  const { matchUps } = structure;
  const matchUpsCount = matchUps && matchUps.length;
  expect(matchUpsCount).toEqual(30);

  const drawPositions = [
    [16, 17],
    [18, 19],
    [20, 21],
    [22, 23],
    [24, 25],
    [26, 27],
    [28, 29],
    [30, 31],
    [undefined, 8],
    [undefined, 9],
    [undefined, 10],
    [undefined, 11],
    [undefined, 12],
    [undefined, 13],
    [undefined, 14],
    [undefined, 15],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, 4],
    [undefined, 5],
    [undefined, 6],
    [undefined, 7],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, 2],
    [undefined, 3],
    [undefined, undefined],
    [undefined, 1],
  ];

  matchUps.forEach((matchUp, i) => {
    expect(matchUp.drawPositions).toMatchObject(drawPositions[i]);
  });
});

it('generates structured entry draw with expected finishing drawPositions', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 31 });
  const { structure } = drawEngine
    .devContext(true)
    .generateDrawType({ drawType: FEED_IN });
  const { matchUps } = structure;
  const matchUpsCount = matchUps && matchUps.length;
  expect(matchUpsCount).toEqual(30);

  const finishingPositionRanges = [
    { loser: [24, 31], winner: [1, 23] },
    { loser: [16, 23], winner: [1, 15] },
    { loser: [12, 15], winner: [1, 11] },
    { loser: [8, 11], winner: [1, 7] },
    { loser: [6, 7], winner: [1, 5] },
    { loser: [4, 5], winner: [1, 3] },
    { loser: [3, 3], winner: [1, 2] },
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

it('can generate FEED_IN_CHAMPIONSHIP with drawSize: 16', () => {
  const drawSize = 16;
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize,
    drawType: FEED_IN_CHAMPIONSHIP,
  });

  expect(mainDrawMatchUps.length).toEqual(drawSize - 1);
  expect(consolationMatchUps.length).toEqual(drawSize - 2);

  expect(links.length).toEqual(4);
  expect(links[0].linkType).toEqual(LOSER);
  expect(links[0].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[1].linkType).toEqual(LOSER);
  expect(links[1].target.feedProfile).toEqual(BOTTOM_UP);
  expect(links[2].linkType).toEqual(LOSER);
  expect(links[2].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[3].linkType).toEqual(LOSER);
  expect(links[3].target.feedProfile).toEqual(BOTTOM_UP);

  expect(links[0].source.roundNumber).toEqual(1);
  expect(links[0].source.roundNumber).toEqual(1);
  expect(links[1].target.roundNumber).toEqual(2);
  expect(links[1].target.roundNumber).toEqual(2);
  expect(links[2].source.roundNumber).toEqual(3);
  expect(links[2].target.roundNumber).toEqual(4);
  expect(links[3].source.roundNumber).toEqual(4);
  expect(links[3].target.roundNumber).toEqual(6);
});

it('can generate FEED_IN_CHAMPIONSHIP with drawSize: 32', () => {
  const drawSize = 32;
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize,
    drawType: FEED_IN_CHAMPIONSHIP,
  });

  expect(mainDrawMatchUps.length).toEqual(drawSize - 1);
  expect(consolationMatchUps.length).toEqual(drawSize - 2);

  expect(links.length).toEqual(5);
  expect(links[0].linkType).toEqual(LOSER);
  expect(links[0].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[1].linkType).toEqual(LOSER);
  expect(links[1].target.feedProfile).toEqual(BOTTOM_UP);
  expect(links[2].linkType).toEqual(LOSER);
  expect(links[2].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[3].linkType).toEqual(LOSER);
  expect(links[3].target.feedProfile).toEqual(BOTTOM_UP);
  expect(links[4].linkType).toEqual(LOSER);
  expect(links[4].target.feedProfile).toEqual(TOP_DOWN);

  expect(links[0].source.roundNumber).toEqual(1);
  expect(links[0].source.roundNumber).toEqual(1);
  expect(links[1].target.roundNumber).toEqual(2);
  expect(links[1].target.roundNumber).toEqual(2);
  expect(links[2].source.roundNumber).toEqual(3);
  expect(links[2].target.roundNumber).toEqual(4);
  expect(links[3].source.roundNumber).toEqual(4);
  expect(links[3].target.roundNumber).toEqual(6);
  expect(links[4].source.roundNumber).toEqual(5);
  expect(links[4].target.roundNumber).toEqual(8);
});

it('can generate FEED_IN_CHAMPIONSHIP with drawSize: 64', () => {
  const drawSize = 64;
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize,
    drawType: FEED_IN_CHAMPIONSHIP,
  });

  expect(mainDrawMatchUps.length).toEqual(drawSize - 1);
  expect(consolationMatchUps.length).toEqual(drawSize - 2);

  expect(links.length).toEqual(6);
  expect(links[0].linkType).toEqual(LOSER);
  expect(links[0].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[1].linkType).toEqual(LOSER);
  expect(links[1].target.feedProfile).toEqual(BOTTOM_UP);
  expect(links[2].linkType).toEqual(LOSER);
  expect(links[2].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[3].linkType).toEqual(LOSER);
  expect(links[3].target.feedProfile).toEqual(BOTTOM_UP);
  expect(links[4].linkType).toEqual(LOSER);
  expect(links[4].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[5].linkType).toEqual(LOSER);
  expect(links[5].target.feedProfile).toEqual(BOTTOM_UP);

  expect(links[0].source.roundNumber).toEqual(1);
  expect(links[0].source.roundNumber).toEqual(1);
  expect(links[1].target.roundNumber).toEqual(2);
  expect(links[1].target.roundNumber).toEqual(2);
  expect(links[2].source.roundNumber).toEqual(3);
  expect(links[2].target.roundNumber).toEqual(4);
  expect(links[3].source.roundNumber).toEqual(4);
  expect(links[3].target.roundNumber).toEqual(6);
  expect(links[4].source.roundNumber).toEqual(5);
  expect(links[4].target.roundNumber).toEqual(8);
  expect(links[5].source.roundNumber).toEqual(6);
  expect(links[5].target.roundNumber).toEqual(10);
});

it('can generate FEED_IN_CHAMPIONSHIP_TO_R16', () => {
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize: 32,
    drawType: FICR16,
  });

  expect(mainDrawMatchUps.length).toEqual(31);
  expect(consolationMatchUps.length).toEqual(23);
  expect(links.length).toEqual(2);
});

it('can generate FEED_IN_CHAMPIONSHIP to RSF', () => {
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize: 32,
    drawType: FICSF,
  });

  expect(mainDrawMatchUps.length).toEqual(31);
  expect(consolationMatchUps.length).toEqual(29);
  expect(links.length).toEqual(4);
});

it('can generate MODIFIED_FEED_IN_CHAMPIONSHIP', () => {
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize: 32,
    drawType: MFIC,
    feedPolicy: { roundGroupedOrder: [] },
  });
  expect(mainDrawMatchUps.length).toEqual(31);
  expect(consolationMatchUps.length).toEqual(23);
  expect(links.length).toEqual(2);
  expect(links[0].target.feedProfile).toEqual(TOP_DOWN);
  expect(links[1].target.feedProfile).toEqual(BOTTOM_UP);
  expect(links[0].target.roundNumber).toEqual(1);
  expect(links[1].target.roundNumber).toEqual(2);

  expect(mainDrawMatchUps.length).toEqual(31);
  expect(consolationMatchUps.length).toEqual(23);

  expect(mainDrawMatchUps[0].finishingPositionRange.loser).toMatchObject([
    17,
    32,
  ]);
  expect(mainDrawMatchUps[0].finishingPositionRange.winner).toMatchObject([
    1,
    16,
  ]);
  expect(consolationMatchUps[0].finishingPositionRange.loser).toMatchObject([
    25,
    32,
  ]);
  expect(consolationMatchUps[0].finishingPositionRange.winner).toMatchObject([
    9,
    24,
  ]);

  expect(mainDrawMatchUps[30].finishingPositionRange.loser).toMatchObject([
    2,
    2,
  ]);
  expect(mainDrawMatchUps[30].finishingPositionRange.winner).toMatchObject([
    1,
    1,
  ]);
  expect(consolationMatchUps[22].finishingPositionRange.loser).toMatchObject([
    10,
    10,
  ]);
  expect(consolationMatchUps[22].finishingPositionRange.winner).toMatchObject([
    9,
    9,
  ]);
});

it('can generate feedInMatchUps', () => {
  verifyexpectedRoundMatchUpsCounts({
    baseDrawSize: 16,
    feedRoundsProfile: [2],
    expectedRoundMatchUpsCounts: [8, 4, 2, 2, 1],
  });

  verifyexpectedRoundMatchUpsCounts({
    baseDrawSize: 16,
    feedRoundsProfile: [2, 2],
    expectedRoundMatchUpsCounts: [8, 4, 2, 2, 2, 1],
  });

  verifyexpectedRoundMatchUpsCounts({
    baseDrawSize: 32,
    feedRoundsProfile: [8, 8, 2, 2],
    expectedRoundMatchUpsCounts: [16, 8, 8, 8, 4, 2, 2, 2, 1],
  });
});

function verifyexpectedRoundMatchUpsCounts({
  baseDrawSize,
  feedRoundsProfile,
  expectedRoundMatchUpsCounts,
}) {
  const { matchUps, roundsCount } = feedInMatchUps({
    feedRoundsProfile,
    baseDrawSize,
  });
  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  generateRange(1, roundsCount + 1).forEach((roundNumber) => {
    expect(roundMatchUps[roundNumber].length).toEqual(
      expectedRoundMatchUpsCounts[roundNumber - 1]
    );
  });
}
