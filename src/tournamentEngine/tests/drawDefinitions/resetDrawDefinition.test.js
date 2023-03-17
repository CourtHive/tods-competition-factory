import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
} from '../../../constants/drawDefinitionConstants';

// prettier-ignore
const scenarios = [
  { drawProfile: { drawSize: 4 }, matchUpsCount: 3 },
  { drawProfile: { drawSize: 32, drawType: COMPASS }, matchUpsCount: 72 },
  { drawProfile: { drawSize: 32, drawType: FEED_IN_CHAMPIONSHIP }, matchUpsCount: 61 },
];

test.each(scenarios)(
  'drawDefinitions can be reset to initial state',
  (scenario) => {
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
    });
  }
);
