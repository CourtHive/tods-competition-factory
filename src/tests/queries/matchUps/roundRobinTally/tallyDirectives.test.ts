import { tallyParticipantResults } from '@Query/matchUps/roundRobinTally/tallyParticipantResults';
import { xa } from '@Tools/extractAttributes';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants and fixtures
import { POLICY_ROUND_ROBIN_TALLY_DEFAULT } from '@Fixtures/policies/POLICY_ROUND_ROBIN_TALLY_DEFAULT';
import { POLICY_ROUND_ROBIN_TALLY_JTT } from '@Fixtures/policies/POLICY_ROUND_ROBIN_TALLY_JTT';
import { POLICY_ROUND_ROBIN_TALLY_TOC } from '@Fixtures/policies/POLICY_ROUND_ROBIN_TALLY_TOC';
import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '@Constants/policyConstants';

import tournamentRecord from './dominantDuo.tods.json';

it('supports multiple policy configurations', () => {
  const result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const RR = tournamentRecord.events[0].drawDefinitions[0].structures[0];
  const structureIds = RR.structures.map(xa('structureId'));

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const structure1MatchUps = matchUps.filter((m) => m.structureId === structureIds[0]);
  const structure2MatchUps = matchUps.filter((m) => m.structureId === structureIds[1]);

  const structureGroupOrder = (structure) =>
    structure.positionAssignments.map((assignment) => participantResults[assignment.participantId].groupOrder);

  let participantResults;

  participantResults = tallyParticipantResults({
    matchUps: structure1MatchUps,
  }).participantResults;

  expect(structureGroupOrder(RR.structures[0])).toEqual([4, 3, 1, 2]);

  const fewestGamesLostWinReversed = {
    headToHead: { disabled: true },
    tallyDirectives: [
      { attribute: 'gamesLost', reversed: true, idsFilter: false },
      { attribute: 'gamesWon', reversed: true, idsFilter: false },
    ],
    GEMscore: ['matchUpsPct', 'tieMatchUpsPct', 'gamesWon', 'gamesPct'],
  };

  participantResults = tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: fewestGamesLostWinReversed,
    },
    matchUps: structure1MatchUps,
  }).participantResults;

  expect(structureGroupOrder(RR.structures[0])).toEqual([4, 3, 2, 1]);

  const fewestGamesLost = {
    headToHead: { disabled: true },
    tallyDirectives: [
      { attribute: 'gamesLost', reversed: true, idsFilter: false },
      { attribute: 'gamesWon', reversed: false, idsFilter: false },
    ],
    GEMscore: ['matchUpsPct', 'tieMatchUpsPct', 'gamesWon', 'gamesPct'],
  };

  participantResults = tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: fewestGamesLost,
    },
    matchUps: structure1MatchUps,
  }).participantResults;

  expect(structureGroupOrder(RR.structures[0])).toEqual([4, 3, 1, 2]);

  const mostDoublesWon = {
    groupOrderKey: 'tieDoublesWon',
    headToHead: { disabled: true },
    tallyDirectives: [{ attribute: 'gamesPct', idsFilter: false }],
  };

  participantResults = tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: mostDoublesWon,
    },
    matchUps: structure2MatchUps,
  }).participantResults;

  expect(structureGroupOrder(RR.structures[1])).toEqual([1, 2, 4, 2]);

  // ------ with policyDefinitions from fixtures ------

  participantResults = tallyParticipantResults({
    policyDefinitions: POLICY_ROUND_ROBIN_TALLY_DEFAULT,
    matchUps: structure2MatchUps,
  }).participantResults;

  expect(structureGroupOrder(RR.structures[1])).toEqual([4, 1, 3, 2]);

  participantResults = tallyParticipantResults({
    policyDefinitions: POLICY_ROUND_ROBIN_TALLY_JTT,
    matchUps: structure2MatchUps,
  }).participantResults;

  expect(structureGroupOrder(RR.structures[1])).toEqual([4, 1, 1, 1]);

  participantResults = tallyParticipantResults({
    policyDefinitions: POLICY_ROUND_ROBIN_TALLY_TOC,
    matchUps: structure2MatchUps,
  }).participantResults;

  expect(structureGroupOrder(RR.structures[1])).toEqual([4, 1, 3, 2]);
});
