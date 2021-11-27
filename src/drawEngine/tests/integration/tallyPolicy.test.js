import { mocksEngine, scoreGovernor, tournamentEngine } from '../../..';

test('roundRobinTally policy can specify tally by games only', () => {
  // prettier-ignore
  const mockProfile = {
    tournamentName: 'Round Robin Points',
    completeAllMatchUps: true,
    policyDefinitions: {
      roundRobinTally: {
	groupOrderKey: 'gamesCount',
        headToHead: { disabled: false },
        disqualifyDefaults: true,
        disqualifyWalkovers: true,
        setsCreditForDefaults: true,
        setsCreditForWalkovers: true,
        gamesCreditForDefaults: true,
        gamesCreditForWalkovers: true,
	tallyDirectives: [
	  { attribute: 'gamesRatio' },
	  { attribute: 'pointsRatio' },
	],
      },
    },

    drawProfiles: [
      {
        drawType: 'ROUND_ROBIN',
        matchUpFormat: 'SET3-S:T20',
        drawSize: 4,
      },
    ],
  };

  let { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const { participantResults } = scoreGovernor.tallyParticipantResults({
    policyDefinitions: mockProfile.policyDefinitions,
    matchUpFormat: mockProfile.matchUpFormat,
    matchUps,
  });
  console.log({ participantResults });
});
