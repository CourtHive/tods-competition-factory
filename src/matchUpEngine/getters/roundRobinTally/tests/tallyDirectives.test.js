import tournamentEngine from '../../../../tournamentEngine/sync';
import { extractAttributes as xa } from '../../../../utilities';
import matchUpEngine from '../../../sync';
import { expect, it } from 'vitest';
import fs from 'fs';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../../constants/policyConstants';

const fewestGamesLostWinReversed = {
  headToHead: { disabled: true },
  tallyDirectives: [
    { attribute: 'gamesLost', reversed: true, idsFilter: false },
    { attribute: 'gamesWon', reversed: true, idsFilter: false },
  ],
  GEMscore: ['matchUpsPct', 'tieMatchUpsPct', 'gamesWon', 'gamesPct'],
};

const fewestGamesLost = {
  headToHead: { disabled: true },
  tallyDirectives: [
    { attribute: 'gamesLost', reversed: true, idsFilter: false },
    { attribute: 'gamesWon', reversed: false, idsFilter: false },
  ],
  GEMscore: ['matchUpsPct', 'tieMatchUpsPct', 'gamesWon', 'gamesPct'],
};

const mostDoublesWon = {
  groupOrderKey: 'tieDoublesWon',
  headToHead: { disabled: true },
  tallyDirectives: [
    { attribute: 'gamesWon', reversed: false, idsFilter: false },
  ],
};

it('supports multiple policy configurations', () => {
  const tournamentJSON = fs.readFileSync(
    './src/matchUpEngine/getters/roundRobinTally/tests/dominantDuo.tods.json',
    'utf-8'
  );
  const tournament = JSON.parse(tournamentJSON);
  let result = tournamentEngine.setState(tournament);
  expect(result.success).toEqual(true);

  const structureIds =
    tournament.events[0].drawDefinitions[0].structures[0].structures.map(
      xa('structureId')
    );

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const structure1MatchUps = matchUps.filter(
    (m) => m.structureId === structureIds[0]
  );
  const structure2MatchUps = matchUps.filter(
    (m) => m.structureId === structureIds[0]
  );

  let participantResults;

  participantResults = matchUpEngine.tallyParticipantResults({
    matchUps: structure1MatchUps,
  }).participantResults;

  console.log(
    'standard',
    Object.values(participantResults).map(xa('groupOrder'))
  );

  /*
  expect(Object.values(participantResults).map(xa('groupOrder'))).toEqual([
    1, 2, 3, 4,
  ]);
  */

  participantResults = matchUpEngine.tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: fewestGamesLostWinReversed,
    },
    matchUps: structure1MatchUps,
  }).participantResults;

  console.log(
    'fewstGaesLostWinReversed',
    Object.values(participantResults).map(xa('groupOrder'))
  );
  /*
  expect(Object.values(participantResults).map(xa('groupOrder'))).toEqual([
    2, 1, 3, 4,
  ]);
  */

  participantResults = matchUpEngine.tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: fewestGamesLost,
    },
    matchUps: structure1MatchUps,
  }).participantResults;

  console.log(
    'fewestGanesLost',
    Object.values(participantResults).map(xa('groupOrder'))
  );
  /*
  expect(Object.values(participantResults).map(xa('groupOrder'))).toEqual([
    2, 1, 4, 3,
  ]);
  */

  participantResults = matchUpEngine.tallyParticipantResults({
    policyDefinitions: {
      [POLICY_TYPE_ROUND_ROBIN_TALLY]: mostDoublesWon,
    },
    matchUps: structure2MatchUps,
  }).participantResults;

  console.log(
    'mostDoublesWon',
    Object.values(participantResults).map(xa('groupOrder'))
  );
  console.log(Object.values(participantResults).map(xa('tieDoublesWon')));
  console.log(Object.values(participantResults).map(xa('tieDoublesLost')));
  console.log(Object.values(participantResults).map(xa('groupOrder')));
  /*
  expect(Object.values(participantResults).map(xa('groupOrder'))).toEqual([
    2, 1, 4, 3,
  ]);
  */
});
