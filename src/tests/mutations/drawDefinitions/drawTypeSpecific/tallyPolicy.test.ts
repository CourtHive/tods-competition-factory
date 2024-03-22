import { tallyParticipantResults } from '@Query/matchUps/roundRobinTally/tallyParticipantResults';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

test('roundRobinTally policy can specify tally by games only', () => {
  // prettier-ignore
  const mockProfile: any = {
    tournamentName: 'Round Robin Points',
    policyDefinitions: {
      roundRobinTally: {
        GEMscore: [ 'gamesPct', 'pointsRatio' ],
        headToHead: { disabled: false },
        groupOrderKey: 'gamesPct',
        gamesCreditForWalkovers: true,
        gamesCreditForDefaults: true,
        setsCreditForWalkovers: true,
        setsCreditForDefaults: true,
        // NOTE: at present "walkovers" and "defaults" are sub sorts within tied groups, but participants are not entirely disqualified
        // disqualifyDefaults: true, // TODO: implement and test => disqualified participants are pushed to the bottom of the group order
        // disqualifyWalkovers: true, //TODO: implement and test =>  disqualified participants are pushed to the bottom of the group order
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

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    ...mockProfile,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const { participantResults } = tallyParticipantResults({
    policyDefinitions: mockProfile.policyDefinitions,
    matchUpFormat: mockProfile.matchUpFormat,
    matchUps,
  });

  Object.values(participantResults).forEach((result: any) => {
    const { GEMscore, gamesPct = 0 } = result;
    const expectation = parseInt((gamesPct * 1000).toString().slice(0, 2));
    // in very rare instances the GEMscore calc is expectation - 1
    expect([expectation - 1, expectation].includes(parseInt(GEMscore?.toString()?.slice(0, 2)))).toEqual(true);
  });
});
