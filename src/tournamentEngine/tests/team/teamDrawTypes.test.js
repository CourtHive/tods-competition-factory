import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { TEAM } from '../../../constants/eventConstants';
import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  OLYMPIC,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

const scenarios = [
  { drawType: SINGLE_ELIMINATION, matchUpsCount: 7 },
  { drawType: ROUND_ROBIN, matchUpsCount: 12 },
  { drawType: FIRST_MATCH_LOSER_CONSOLATION, matchUpsCount: 12 },
  { drawType: COMPASS, matchUpsCount: 12 },
  { drawType: OLYMPIC, matchUpsCount: 12 },
  { drawType: FEED_IN_CHAMPIONSHIP, matchUpsCount: 13 },
];
it.each(scenarios)('can generate TEAM ROUND_ROBIN', (scenario) => {
  const { drawType, matchUpsCount } = scenario;
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: TEAM, drawSize: 8, drawType }],
  });
  tournamentEngine.setState(result.tournamentRecord);
  result = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(result.matchUps.length).toEqual(matchUpsCount);
});
