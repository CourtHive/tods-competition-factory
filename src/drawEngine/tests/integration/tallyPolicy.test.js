import { mocksEngine, tournamentEngine } from '../../..';
import matchUpEngine from '../../../matchUpEngine/sync';
import { expect, test } from 'vitest';

test('roundRobinTally policy can specify tally by games only', () => {
  // prettier-ignore
  const mockProfile = {
    tournamentName: 'Round Robin Points',
    policyDefinitions: {
      roundRobinTally: {
	groupOrderKey: 'gamesPct',
        headToHead: { disabled: false },
        disqualifyDefaults: true,
        disqualifyWalkovers: true,
        setsCreditForDefaults: true,
        setsCreditForWalkovers: true,
        gamesCreditForDefaults: true,
        gamesCreditForWalkovers: true,
	GEMscore: [ 'gamesPct', 'pointsRatio' ],
      },
    },

    drawProfiles: [
      {
        drawType: 'ROUND_ROBIN',
        matchUpFormat: 'SET1-S:T20',
        drawSize: 4,
      },
    ],
  };

  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    ...mockProfile,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const { participantResults } = matchUpEngine.tallyParticipantResults({
    policyDefinitions: mockProfile.policyDefinitions,
    matchUpFormat: mockProfile.matchUpFormat,
    matchUps,
  });

  Object.values(participantResults).forEach((result) => {
    const { GEMscore, gamesPct = 0 } = result;
    expect(GEMscore?.toString()?.slice(0, 2)).toEqual(
      (gamesPct * 1000).toString().slice(0, 2)
    );
  });
});
