import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';

import { NTRP, UTR, WTN } from '../../../../fixtures/ratings/ratingConstants';

const scenarios = [
  { considerGames: false },
  { considerGames: true },
  { ratingType: UTR },
  { ratingType: WTN },
  { ratingType: NTRP },
];
test.each(scenarios)(
  'it can calculate new ratings given matchUp results',
  (scenario) => {
    const { considerGames, ratingType } = scenario;
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize: 8 }],
      completeAllMatchUps: true,
      randomWinningSide: true,
    });

    tournamentEngine.setState(tournamentRecord);

    const { matchUps } = tournamentEngine.allTournamentMatchUps();
    expect(matchUps.length).toEqual(7);

    const matchUpIds = matchUps.map(({ matchUpId }) => matchUpId);
    let result = scaleEngine.processMatchUps({
      considerGames,
      matchUpIds,
      ratingType,
    });
    expect(result.success).toEqual(true);
    expect(result.processedMatchUpIds.length).toEqual(matchUpIds.length);

    const { tournamentParticipants } =
      tournamentEngine.getTournamentParticipants({
        withStatistics: true,
        withMatchUps: true,
      });

    for (const participant of tournamentParticipants) {
      expect(participant.timeItems.length).toEqual(
        participant.statistics[0].denominator
      );
    }
  }
);
