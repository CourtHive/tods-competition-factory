import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { TEAM } from '../../../constants/eventConstants';
import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  OLYMPIC,
  PLAY_OFF,
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
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: TEAM, drawSize: 8, drawType }],
  });
  tournamentEngine.setState(tournamentRecord);
  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(matchUps.length).toEqual(matchUpsCount);
  matchUps.forEach((matchUp) => {
    expect(matchUp.tieFormat).not.toBeUndefined();
    expect(matchUp.tieMatchUps.length).toEqual(9);
  });

  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(event.tieFormat).not.toBeUndefined();
  expect(drawDefinition.tieFormat).toBeUndefined();
});

it('generates playoff structures for TEAM events and propagates tieFormat', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { eventType: TEAM, drawSize: 8, drawType: SINGLE_ELIMINATION },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  let result = tournamentEngine.addPlayoffStructures({
    playoffStructureNameBase: '3-4 Playoff',
    playoffPositions: [3, 4],
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [PLAY_OFF] },
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(matchUp.tieFormat).not.toBeUndefined();
  expect(matchUp.tieMatchUps.length).toEqual(9);
});
