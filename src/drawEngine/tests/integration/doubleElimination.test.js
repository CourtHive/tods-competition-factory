import { expect, it } from 'vitest';
import {
  competitionEngine,
  mocksEngine,
  tournamentEngine,
  utilities,
} from '../../../';

import { DOUBLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';
import {
  COMPLETED,
  TO_BE_PLAYED,
  upcomingMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';

it('generates valid DOUBLE_ELIMINATION', () => {
  const drawSize = 32;
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: DOUBLE_ELIMINATION }],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const matchUpsCount = matchUps.length;

  expect(utilities.unique(matchUps.map((m) => m.matchUpStatus))).toEqual([
    TO_BE_PLAYED,
  ]);

  matchUps = competitionEngine.allCompetitionMatchUps({
    matchUpFilters: { matchUpStatuses: upcomingMatchUpStatuses },
    nextMatchUps: true,
  }).matchUps;

  expect(matchUps.length).toEqual(matchUpsCount);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { structures, links } = drawDefinition;
  // useful for logging out ids of each structure
  const structureMap = structures.map(({ structureName, structureId }) => ({
    [structureName]: structureId,
  }));
  expect(structureMap.length).toEqual(3);

  let power = 1;
  let ds = drawSize;
  while (ds > 2) {
    ds = ds / 2;
    power += 1;
  }
  expect(power + 3).toEqual(links.length);
});

it('mocksEngine can complete DOUBLE_ELIMINATION matchUps', () => {
  const drawSize = 32;
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: DOUBLE_ELIMINATION }],
    completeAllMatchUps: true,
  });
  expect(result.success).toEqual(true);

  tournamentEngine.setState(result.tournamentRecord);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const matchUpsCount = matchUps.length;
  const completedMatchUps = matchUps.filter(
    ({ matchUpStatus }) => matchUpStatus === COMPLETED
  );
  // mocksEngine won't complete the fed final or decider
  expect(matchUpsCount).toEqual(completedMatchUps.length + 2);

  const readyToScore = matchUps.filter((m) => m.readyToScore);
  expect(readyToScore.length).toEqual(1);
  expect(readyToScore[0].roundName).toEqual('Final');
});
