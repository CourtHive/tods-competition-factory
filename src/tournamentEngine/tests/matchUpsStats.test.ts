import { instanceCount } from '../../utilities';
import mocksEngine from '../../mocksEngine';
import tournamentEngine from '../sync';
import { expect, it } from 'vitest';

import { COMPETITIVE, DECISIVE, ROUTINE } from '../../constants/statsConstants';

it('can generate competitive statistics for matchUps and add competitiveness', () => {
  const mocksProfile = {
    drawProfiles: [{ drawSize: 32 }],
    completeAllMatchUps: true,
  };
  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord(mocksProfile);

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine.allTournamentMatchUps({
    contextProfile: { withCompetitiveness: true },
  }).matchUps;

  const result = tournamentEngine.getMatchUpsStats({ matchUps });
  expect(result.success).toEqual(true);
  const bandTotals: number[] = Object.values(result.competitiveBands);
  const sum = bandTotals.reduce((a, b) => a + b);
  expect(Math.round(sum)).toEqual(100);

  let matchUpsCompetitiveness = instanceCount(
    matchUps
      .map(({ competitiveProfile }) => competitiveProfile.competitiveness)
      .filter(Boolean)
  );
  expect(matchUpsCompetitiveness[ROUTINE]).not.toBeUndefined();

  matchUps = tournamentEngine.allEventMatchUps({
    contextProfile: { withCompetitiveness: true },
    inContext: true,
    eventId,
  }).matchUps;

  matchUpsCompetitiveness = instanceCount(
    matchUps
      .map(({ competitiveProfile }) => competitiveProfile.competitiveness)
      .filter(Boolean)
  );
  expect(matchUpsCompetitiveness[ROUTINE]).not.toBeUndefined();

  matchUps = tournamentEngine.allDrawMatchUps({
    contextProfile: { withCompetitiveness: true },
    inContext: true,
    drawId,
  }).matchUps;

  matchUpsCompetitiveness = instanceCount(
    matchUps
      .map(({ competitiveProfile }) => competitiveProfile.competitiveness)
      .filter(Boolean)
  );
  expect(matchUpsCompetitiveness[ROUTINE]).not.toBeUndefined();
});

it('can determine competitive band for matchUps', () => {
  const mocksProfile = {
    drawProfiles: [
      {
        drawSize: 8,
        outcomes: [
          {
            roundNumber: 1,
            roundPosition: 1,
            scoreString: '6-1 6-1',
            winningSide: 1,
          },
          {
            roundNumber: 1,
            roundPosition: 2,
            scoreString: '6-2 6-3',
            winningSide: 1,
          },
          {
            roundNumber: 1,
            roundPosition: 3,
            scoreString: '6-3 6-4',
            winningSide: 1,
          },
          {
            roundNumber: 1,
            roundPosition: 4,
            scoreString: '6-0 6-0',
            winningSide: 1,
          },
        ],
      },
    ],
  };
  const { tournamentRecord } =
    mocksEngine.generateTournamentRecord(mocksProfile);

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { roundNumbers: [1] },
  });

  expect(matchUps.length).toEqual(4);

  const competitiveness = matchUps.map(
    (matchUp) =>
      tournamentEngine.getMatchUpCompetitiveProfile({ matchUp }).competitiveness
  );

  expect(competitiveness).toEqual([DECISIVE, ROUTINE, COMPETITIVE, DECISIVE]);
});
