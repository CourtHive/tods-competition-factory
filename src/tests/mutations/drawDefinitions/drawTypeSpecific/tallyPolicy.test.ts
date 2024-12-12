import { tallyParticipantResults } from '@Query/matchUps/roundRobinTally/tallyParticipantResults';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

// Constants
import { ROUND_ROBIN } from '@Constants/drawDefinitionConstants';

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
        matchUpFormat: 'SET1-S:T20',
        drawType: ROUND_ROBIN,
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

test('roundRobinTally policy can specify groupTotalGamesPlayed and groupTotalSetsPlayed', () => {
  const mockProfile: any = {
    policyDefinitions: { roundRobinTally: { groupTotalGamesPlayed: true, groupTotalSetsPlayed: true } },
    drawProfiles: [{ drawType: ROUND_ROBIN, drawSize: 4 }],
    tournamentName: 'group total games and sets',
  };

  mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    setState: true,
    ...mockProfile,
  });

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const { participantResults } = tallyParticipantResults({
    policyDefinitions: mockProfile.policyDefinitions,
    matchUpFormat: mockProfile.matchUpFormat,
    matchUps,
  });

  let gamesPctTotal = 0;
  let setsPctTotal = 0;
  Object.values(participantResults).forEach((result: any) => {
    const { setsPct, gamesPct = 0 } = result;
    gamesPctTotal += gamesPct;
    setsPctTotal += setsPct;
  });
  expect(Math.round(gamesPctTotal)).toEqual(1);
  expect(Math.round(setsPctTotal)).toEqual(1);
});
