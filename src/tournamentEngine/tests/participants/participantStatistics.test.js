import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { WIN_RATIO } from '../../../constants/statsConstants';

const scenarios = [{ drawProfiles: [{ drawSize: 8 }], matchUpsCount: 7 }];

test.each(scenarios)(
  'it can calculate new ratings given matchUp results',
  ({ drawProfiles, matchUpsCount }) => {
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      completeAllMatchUps: true,
      randomWinningSide: true,
      drawProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    const { matchUps } = tournamentEngine.allTournamentMatchUps();
    expect(matchUps.length).toEqual(matchUpsCount);

    const { tournamentParticipants } =
      tournamentEngine.getTournamentParticipants({
        withStatistics: true,
        withMatchUps: true,
      });

    const { participants, participantMap } = tournamentEngine.getParticipants({
      withStatistics: true,
    });

    expect(participants.every(({ statistics }) => statistics.length)).toEqual(
      true
    );

    for (const participant of tournamentParticipants) {
      const winRatio = participant.statistics.find(
        ({ statCode }) => statCode === WIN_RATIO
      );
      const matchUpsCount = participant.matchUps.length;
      expect(winRatio.denominator).toEqual(matchUpsCount);
      const {
        /*
        counters: {
          wins,
          losses,
          [SINGLES]: { wins: singlesWins, losses: singlesLosses },
        },
	*/
        statistics,
      } = participantMap[participant.participantId];
      expect(statistics[WIN_RATIO].denominator).toEqual(matchUpsCount);
    }
  }
);
