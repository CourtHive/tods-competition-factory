import tournamentEngine from '../../../../tournamentEngine/sync';
import { extractAttributes as xa } from '../../../../utilities';
import matchUpEngine from '../../../sync';
import { expect, it } from 'vitest';
import fs from 'fs';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../../constants/policyConstants';

it('supports multiple policy configurations', () => {
  const tournamentJSON = fs.readFileSync(
    './src/matchUpEngine/getters/roundRobinTally/tests/dominantDuo.tods.json',
    'utf-8'
  );
  const tournament = JSON.parse(tournamentJSON);
  let result = tournamentEngine.setState(tournament);
  expect(result.success).toEqual(true);

  const RR = tournament.events[0].drawDefinitions[0].structures[0];
  const structureIds = RR.structures.map(xa('structureId'));

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const structure1MatchUps = matchUps.filter(
    (m) => m.structureId === structureIds[0]
  );
  const structure2MatchUps = matchUps.filter(
    (m) => m.structureId === structureIds[1]
  );

  const getGroupOrder = (structure) =>
    structure.positionAssignments.map(
      (assignment) => participantResults[assignment.participantId].groupOrder
    );

  let participantResults;

  participantResults = matchUpEngine.tallyParticipantResults({
    matchUps: structure1MatchUps,
  }).participantResults;

  expect(getGroupOrder(RR.structures[0])).toEqual([4, 3, 1, 2]);

  const fewestGamesLostWinReversed = {
    headToHead: { disabled: true },
    tallyDirectives: [
      { attribute: 'gamesLost', reversed: true, idsFilter: false },
      { attribute: 'gamesWon', reversed: true, idsFilter: false },
    ],
    GEMscore: ['matchUpsPct', 'tieMatchUpsPct', 'gamesWon', 'gamesPct'],
  };

  participantResults = matchUpEngine.tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: fewestGamesLostWinReversed,
    },
    matchUps: structure1MatchUps,
  }).participantResults;

  expect(getGroupOrder(RR.structures[0])).toEqual([4, 3, 2, 1]);

  const fewestGamesLost = {
    headToHead: { disabled: true },
    tallyDirectives: [
      { attribute: 'gamesLost', reversed: true, idsFilter: false },
      { attribute: 'gamesWon', reversed: false, idsFilter: false },
    ],
    GEMscore: ['matchUpsPct', 'tieMatchUpsPct', 'gamesWon', 'gamesPct'],
  };

  participantResults = matchUpEngine.tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: fewestGamesLost,
    },
    matchUps: structure1MatchUps,
  }).participantResults;

  expect(getGroupOrder(RR.structures[0])).toEqual([4, 3, 1, 2]);

  const mostDoublesWon = {
    groupOrderKey: 'tieDoublesWon',
    headToHead: { disabled: true },
    tallyDirectives: [{ attribute: 'gamesPct', idsFilter: false }],
  };

  participantResults = matchUpEngine.tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: mostDoublesWon,
    },
    matchUps: structure2MatchUps,
  }).participantResults;

  expect(getGroupOrder(RR.structures[1])).toEqual([1, 2, 4, 2]);
});
