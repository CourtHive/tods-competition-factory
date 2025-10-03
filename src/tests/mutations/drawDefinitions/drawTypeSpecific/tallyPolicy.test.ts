import { tallyParticipantResults } from '@Query/matchUps/roundRobinTally/tallyParticipantResults';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

// Constants
import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '@Constants/policyConstants';
import { ROUND_ROBIN } from '@Constants/drawDefinitionConstants';

import tournamentRecord from '@Tests/testHarness/tallyPolicy.tods.json';
import { testTournaments } from './test-tournament';
import { TEAM_MATCHUP } from '@Constants/matchUpTypes';

// test('roundRobinTally policy can specify tally by games only', () => {
//   // prettier-ignore
//   const mockProfile: any = {
//     tournamentName: 'Round Robin Points',
//     policyDefinitions: {
//       roundRobinTally: {
//         GEMscore: [ 'gamesPct', 'pointsRatio' ],
//         headToHead: { disabled: false },
//         groupOrderKey: 'gamesPct',
//         gamesCreditForWalkovers: true,
//         gamesCreditForDefaults: true,
//         setsCreditForWalkovers: true,
//         setsCreditForDefaults: true,
//         // NOTE: at present "walkovers" and "defaults" are sub sorts within tied groups, but participants are not entirely disqualified
//         // disqualifyDefaults: true, // TODO: implement and test => disqualified participants are pushed to the bottom of the group order
//         // disqualifyWalkovers: true, //TODO: implement and test =>  disqualified participants are pushed to the bottom of the group order
//       },
//     },

//     drawProfiles: [
//       {
//         matchUpFormat: 'SET1-S:T20',
//         drawType: ROUND_ROBIN,
//         drawSize: 4,
//       },
//     ],
//   };

//   const { tournamentRecord } = mocksEngine.generateTournamentRecord({
//     completeAllMatchUps: true,
//     ...mockProfile,
//   });

//   tournamentEngine.setState(tournamentRecord);

//   const { matchUps } = tournamentEngine.allTournamentMatchUps();

//   const { participantResults } = tallyParticipantResults({
//     policyDefinitions: mockProfile.policyDefinitions,
//     matchUpFormat: mockProfile.matchUpFormat,
//     matchUps,
//   });

//   Object.values(participantResults).forEach((result: any) => {
//     const { GEMscore, gamesPct = 0 } = result;
//     const expectation = parseInt((gamesPct * 1000).toString().slice(0, 2));
//     // in very rare instances the GEMscore calc is expectation - 1
//     expect([expectation - 1, expectation].includes(parseInt(GEMscore?.toString()?.slice(0, 2)))).toEqual(true);
//   });
// });

// test('roundRobinTally policy can specify groupTotalGamesPlayed and groupTotalSetsPlayed', () => {
//   const mockProfile: any = {
//     policyDefinitions: { roundRobinTally: { groupTotalGamesPlayed: true, groupTotalSetsPlayed: true } },
//     drawProfiles: [{ drawType: ROUND_ROBIN, drawSize: 4 }],
//     tournamentName: 'group total games and sets',
//   };

//   mocksEngine.generateTournamentRecord({
//     completeAllMatchUps: true,
//     setState: true,
//     ...mockProfile,
//   });

//   const { matchUps } = tournamentEngine.allTournamentMatchUps();

//   const { participantResults } = tallyParticipantResults({
//     policyDefinitions: mockProfile.policyDefinitions,
//     matchUpFormat: mockProfile.matchUpFormat,
//     matchUps,
//   });

//   let gamesPctTotal = 0;
//   let setsPctTotal = 0;
//   Object.values(participantResults).forEach((result: any) => {
//     const { setsPct, gamesPct = 0 } = result;
//     gamesPctTotal += gamesPct;
//     setsPctTotal += setsPct;
//   });
//   expect(Math.round(gamesPctTotal)).toEqual(1);
//   expect(Math.round(setsPctTotal)).toEqual(1);
// });

// test('roundRobinTally policy can specify groupTotals for both setsPct and gamesPct', () => {
//   tournamentEngine.reset();
//   tournamentEngine.setState(tournamentRecord);
//   const { matchUps } = tournamentEngine.allTournamentMatchUps();

//   let gamesPctTotal = 0;
//   let participantResults = tallyParticipantResults({
//     matchUps,
//   }).participantResults;

//   Object.values(participantResults).forEach((result: any) => {
//     const { gamesPct = 0 } = result;
//     gamesPctTotal += gamesPct;
//   });
//   // when the default tallyPolicy is used then the gamesPct is gamesWon/(gamesWon + gamesLost) for each participant
//   // ... so the total is always greater than 1.1
//   expect(gamesPctTotal).toBeGreaterThan(1.1);

//   const topLevelGroupTotalsPolicy = {
//     groupTotalGamesPlayed: true, // This tallyPolicy says that the denominator for gamesPct should always be ALL GAMES PLAYED BY ALL PARTICIPANTS
//     groupTotalSetsPlayed: true, // This tallyPolicy says that the denominator for setsPct should always be ALL SETS PLAYED BY ALL PARTICIPANTS
//   };
//   participantResults = tallyParticipantResults({
//     policyDefinitions: { [POLICY_TYPE_ROUND_ROBIN_TALLY]: topLevelGroupTotalsPolicy },
//     matchUps,
//   }).participantResults;

//   gamesPctTotal = 0;
//   Object.values(participantResults).forEach((result: any) => {
//     const { gamesPct = 0 } = result;
//     gamesPctTotal += gamesPct;
//   });
//   // when the topLevelGroupTotalsPolicy is in force the total of all participants should equal 1
//   // ... in some scenarios it is .99999999999
//   expect(Math.round(gamesPctTotal)).toEqual(1);
//   expect(gamesPctTotal).toBeLessThan(1.1);

//   const discreteGroupTotalsPolicy = {
//     tallyDirectives: [
//       // ... <other preceding directives> ...
//       // This tallyDirective says that WHEN this tallyDirective comes into force...
//       // ...the denominator for setsPct should be ALL SETS PLAYED BY ALL PARTICIPANTS
//       { attribute: 'setsPct', idsFilter: false, groupTotals: true },
//       // This tallyDirective says that WHEN this tallyDirective comes into force...
//       // ...the denominator for gamesPct should be ALL GAMES PLAYED BY ALL PARTICIPANTS
//       { attribute: 'gamesPct', idsFilter: false, groupTotals: true },
//     ],
//   };
//   const result: any = tallyParticipantResults({
//     policyDefinitions: { [POLICY_TYPE_ROUND_ROBIN_TALLY]: discreteGroupTotalsPolicy },
//     generateReport: true,
//     matchUps,
//   });

//   participantResults = result.participantResults;

//   gamesPctTotal = 0;
//   Object.values(participantResults).forEach((result: any) => {
//     const { gamesPct = 0 } = result;
//     gamesPctTotal += gamesPct;
//   });
//   // when the discreteGroupTotalsPolicy is used the value in the participantResults does not reflect
//   // the computed value that is used in the tiebreaking.
//   expect(gamesPctTotal).toBeGreaterThan(1.1);

//   // the value used in breaking ties can be seen in the report that is generated
//   expect(result?.report?.[1].attribute).toEqual('setsPct');
//   expect(result?.report?.[1].groupTotals).toEqual(true);
//   expect(result?.report?.[2].attribute).toEqual('gamesPct');
//   expect(result?.report?.[2].groupTotals).toEqual(true);
// });

test('test the tallyPolicy default', () => {
  tournamentEngine.reset();
  tournamentEngine.setState(testTournaments[0]);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  let participantResults = tallyParticipantResults({
    matchUps,
  }).participantResults;

  expect(participantResults["66D7DC25-918A-4B81-BE1C-A3A732609BEA"].groupOrder).toBe(1) // Maxxx Acevxxx
  expect(participantResults["A4CA6D93-CAEF-48E3-9A78-52FE58813A51"].groupOrder).toBe(3) // Camexxx Carnexxx
  expect(participantResults["E314D2E4-C779-4334-AF8C-3A7491E0C472"].groupOrder).toBe(2) // Roxxx Chaxxx
});

test('test the tallyPolicy default (team event)', () => {
  tournamentEngine.reset();
  tournamentEngine.setState(testTournaments[1]);
  const drawId = testTournaments[1].events[0].drawDefinitions[0].drawId;
  const { matchUps } = tournamentEngine.allTournamentMatchUps({ drawDefinition: tournamentEngine.getDrawData({ drawId }) });
  const hasTeamMatchUps = matchUps.some((matchUp) => matchUp.matchUpType === TEAM_MATCHUP);
  const consideredMatchUps = hasTeamMatchUps
    ? matchUps.filter((matchUp) => matchUp.matchUpType === TEAM_MATCHUP)
    : matchUps;
  let participantResults = tallyParticipantResults({
    matchUps: consideredMatchUps  
  }).participantResults;

  console.log(Object.keys(participantResults).map((key: string) => ({
    groupOrder: participantResults[key].groupOrder,
    participantId: key,
    setsPct: participantResults[key].setsPct,
  })));
  expect(participantResults["C1605121-3499-4C63-B0E9-B7F4C510D698"].groupOrder).toBe(2) // Team C
  expect(participantResults["194b8b61-0d55-4d21-a7c1-79ecc4bc833a"].groupOrder).toBe(1) // Team R234 Team
  expect(participantResults["81D98829-165B-45B7-A2C9-DDA11A09B529"].groupOrder).toBe(3) // Team B
  expect(participantResults["BC4EB278-C039-4BCF-A2EF-5CB17CC7FFC"].groupOrder).toBe(4) // Team A
});
