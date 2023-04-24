import { mocksEngine, setSubscriptions } from '../../..';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import {
  PLAY_OFF,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

// in a round robin finishingPositions are determined by WIN_RATIO
// the finishingPositionRange for { winner, loser } should be equivalent
// because even a loser of one match can ultimately win the bracket/grouping
test('ROUND_ROBIN matchUps have equivalent finishingPositionRanges', () => {
  const drawSize = 16;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: ROUND_ROBIN }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  for (const matchUp of matchUps) {
    expect(matchUp.finishingPositionRange.loser).toEqual([1, drawSize]);
    expect(matchUp.finishingPositionRange.winner).toEqual([1, drawSize]);
  }
});

test('ROUND_ROBIN_WITH_PLAYOFFS will have accurate playoff finishingPositionRanges', () => {
  let matchUpAddNotices = [];

  const subscriptions = {
    addMatchUps: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  const drawSize = 32;
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: ROUND_ROBIN_WITH_PLAYOFF }],
  });

  tournamentEngine.setState(tournamentRecord);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();

  const losers = [];
  const winners = [];
  for (const matchUp of matchUps) {
    if (matchUp.roundPosition) {
      winners.push(matchUp.finishingPositionRange.winner);
      losers.push(matchUp.finishingPositionRange.loser);
    }
  }

  // prettier-ignore
  expect(winners).toEqual([[1, 4], [1, 4], [1, 4], [1, 4], [1, 2], [1, 2], [1, 1]]);

  // prettier-ignore
  expect(losers).toEqual([[5, 8], [5, 8], [5, 8], [5, 8], [3, 4], [3, 4], [2, 2]]);

  let {
    drawDefinition: { structures, links },
  } = tournamentEngine.getEvent({ drawId });

  expect(links.length).toEqual(1);
  expect(links[0].source.structureId).toEqual(structures[0].structureId);
  expect(links[0].target.structureId).toEqual(structures[1].structureId);

  const structureId = structures.find(
    ({ stage }) => stage === PLAY_OFF
  ).structureId;

  const { playoffRounds, playoffRoundsRanges, positionsPlayedOff } =
    tournamentEngine.getAvailablePlayoffProfiles({
      structureId,
      drawId,
    });
  expect(playoffRounds).toEqual([1, 2]);
  expect(positionsPlayedOff).toEqual([1, 2]);
  expect(playoffRoundsRanges.length).toEqual(2);

  let result = tournamentEngine.addPlayoffStructures({
    playoffPositions: [1, 2],
    structureId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  // no structure was added
  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  expect(structures.length).toEqual(2);

  const playoffAttributes = { '0-2': { name: 'Silver', abbreviation: 'S' } };
  result = tournamentEngine.addPlayoffStructures({
    playoffPositions: [3, 4],
    playoffAttributes,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  expect(structures.length).toEqual(3);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { structureIds: [structures[2].structureId] },
  });
  expect(matchUp.structureName).toEqual('Silver');
  expect(matchUp.stageSequence).toEqual(2);
  expect(matchUp.finishingPositionRange).toEqual({
    loser: [4, 4],
    winner: [3, 3],
  });

  expect(matchUpAddNotices).toEqual([55, 1]);
});
