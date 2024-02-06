import tournamentEngine from '@Engines/syncEngine';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

// constants
import { AD_HOC, COMPASS, FEED_IN_CHAMPIONSHIP, ROUND_ROBIN } from '@Constants/drawDefinitionConstants';

// prettier-ignore
const scenarios = [
  { drawProfile: { drawSize: 4 }, matchUpsCount: 3 },
  { drawProfile: { drawSize: 32, drawType: COMPASS }, matchUpsCount: 72 },
  { drawProfile: { drawSize: 32, drawType: FEED_IN_CHAMPIONSHIP }, matchUpsCount: 61 },
  { drawProfile: { drawSize: 32, drawType: ROUND_ROBIN }, matchUpsCount: 48, expectAllDrawPositions: true },
  { drawProfile: { drawSize: 8, drawType: AD_HOC, roundsCount: 3, automated: true }, matchUpsCount: 12, expectSideParticipants: true },
];

test.each(scenarios)('drawDefinitions can be reset to initial state', (scenario) => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [scenario.drawProfile],
    completeAllMatchUps: true,
  });
  tournamentEngine.setState(tournamentRecord);

  let { completedMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(completedMatchUps.length).toEqual(scenario.matchUpsCount);

  const result = tournamentEngine.resetDrawDefinition({ drawId });
  expect(result.success).toEqual(true);

  completedMatchUps = tournamentEngine.tournamentMatchUps().completedMatchUps;
  expect(completedMatchUps.length).toEqual(0);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  matchUps.forEach((matchUp) => {
    expect(matchUp.score).toEqual({});
    expect(matchUp.matchUpFormatCodes).toBeUndefined();
    if (scenario.expectAllDrawPositions) {
      expect(matchUp.drawPositions.filter(Boolean).length).toEqual(2);
    }
    if (scenario.expectSideParticipants) {
      matchUp.sides.forEach((side) => {
        expect(side.participant).toBeDefined();
      });
    }
  });
});
