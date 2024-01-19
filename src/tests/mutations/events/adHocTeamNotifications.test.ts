import { setSubscriptions } from '../../../global/state/globalState';
import { getMatchUpId } from '../../../global/functions/extractors';
import { mocksEngine, tournamentEngine } from '../../..';
import { expect, it } from 'vitest';

import { ADD_MATCHUPS, DELETED_MATCHUP_IDS } from '../../../constants/topicConstants';
import { COLLEGE_DEFAULT, DOMINANT_DUO } from '../../../constants/tieFormatConstants';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../constants/eventConstants';
import { unique } from '../../../tools/arrays';

// testing for generation of addMatchUps notifications for tieMatchUps in AD_HOC TEAM events
// each scenario generates a different number of matchUps due to different tieFormats having different collectionDefinitions
const scenarios = [
  { drawProfile: { tieFormatName: COLLEGE_DEFAULT, drawSize: 4 }, expectation: { added: 20 } },
  { drawProfile: { tieFormatName: DOMINANT_DUO, drawSize: 4 }, expectation: { added: 8 } },
];

it.each(scenarios)('generates addMatchUps notifications for tieMatchUps in AD_HOC TEAM events', (scenario) => {
  const addedMatchUpIds: string[] = [];
  const deletedMatchUpIds: string[] = [];
  const subscriptions = {
    [ADD_MATCHUPS]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach((item) => {
          const matchUpIds = item.matchUps.map(getMatchUpId);
          addedMatchUpIds.push(...matchUpIds);
        });
      }
    },
    [DELETED_MATCHUP_IDS]: (notices) => {
      notices.forEach(({ matchUpIds }) => deletedMatchUpIds.push(...matchUpIds));
    },
  };

  setSubscriptions({ subscriptions });

  const drawId = 'drawId';
  const result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { ...scenario.drawProfile, drawType: AD_HOC, automated: true, eventType: TEAM, roundsCount: 1, drawId },
    ],
    setState: true,
  });
  expect(result.success).toEqual(true);
  expect(unique(addedMatchUpIds).length).toEqual(scenario.expectation.added);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual(scenario.expectation.added);

  const teamMatchUpIds = tournamentEngine
    .allTournamentMatchUps({ matchUpFilters: { matchUpTypes: [TEAM] } })
    .matchUps.map(getMatchUpId);

  const deletionResult = tournamentEngine.deleteAdHocMatchUps({ matchUpIds: teamMatchUpIds, drawId });
  expect(deletionResult.success).toEqual(true);
  expect(deletedMatchUpIds.length).toEqual(scenario.expectation.added);
});
