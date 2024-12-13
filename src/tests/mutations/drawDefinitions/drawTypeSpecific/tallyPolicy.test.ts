import { tallyParticipantResults } from '@Query/matchUps/roundRobinTally/tallyParticipantResults';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

// Constants
import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '@Constants/policyConstants';
import { ROUND_ROBIN } from '@Constants/drawDefinitionConstants';

import tournamentRecord from '@Tests/testHarness/tallyPolicy.tods.json';

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

test('roundRobinTally policy can specify groupTotals for both setsPct and gamesPct', () => {
  tournamentEngine.reset();
  tournamentEngine.setState(tournamentRecord);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  let gamesPctTotal = 0;
  let participantResults = tallyParticipantResults({
    matchUps,
  }).participantResults;

  Object.values(participantResults).forEach((result: any) => {
    const { gamesPct = 0 } = result;
    gamesPctTotal += gamesPct;
  });
  expect(gamesPctTotal).toBeGreaterThan(1.1);

  const topLevelGroupTotalsPolicy = {
    groupTotalGamesPlayed: true,
    groupTotalSetsPlayed: true,
  };
  participantResults = tallyParticipantResults({
    policyDefinitions: { [POLICY_TYPE_ROUND_ROBIN_TALLY]: topLevelGroupTotalsPolicy },
    matchUps,
  }).participantResults;

  gamesPctTotal = 0;
  Object.values(participantResults).forEach((result: any) => {
    const { gamesPct = 0 } = result;
    gamesPctTotal += gamesPct;
  });
  expect(Math.round(gamesPctTotal)).toEqual(1);
  expect(gamesPctTotal).toBeLessThan(1.1);

  const discreteGroupTotalsPolicy = {
    tallyDirectives: [
      { attribute: 'setsPct', idsFilter: false, groupTotals: true },
      { attribute: 'gamesPct', idsFilter: false, groupTotals: true },
      { attribute: 'setsPct', idsFilter: true, groupTotals: true },
      { attribute: 'gamesPct', idsFilter: true, groupTotals: true },
    ],
  };
  const result: any = tallyParticipantResults({
    policyDefinitions: { [POLICY_TYPE_ROUND_ROBIN_TALLY]: discreteGroupTotalsPolicy },
    generateReport: true,
    matchUps,
  });

  participantResults = result.participantResults;

  gamesPctTotal = 0;
  Object.values(participantResults).forEach((result: any) => {
    const { gamesPct = 0 } = result;
    gamesPctTotal += gamesPct;
  });
  expect(gamesPctTotal).toBeGreaterThan(1.1);

  expect(result?.report?.[1].attribute).toEqual('setsPct');
  expect(result?.report?.[1].groupTotals).toEqual(true);
  expect(result?.report?.[2].attribute).toEqual('gamesPct');
  expect(result?.report?.[2].groupTotals).toEqual(true);
});
