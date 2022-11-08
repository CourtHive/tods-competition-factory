import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  FEED_IN_CHAMPIONSHIP_TO_R16,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

test('consolation fed player advanced by WO/WO will be removed when WO/WO cleared', () => {
  const withPlayoffs = {
    roundProfiles: [{ 3: 1 }, { 4: 1 }],
    playoffAttributes: {
      '0-3': { name: 'Silver', abbreviation: 'S' },
      '0-4': { name: 'Gold', abbreviation: 'G' },
    },
  };
  let drawProfiles = [
    {
      drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
      withPlayoffs,
      drawSize: 32,
    },
  ];
  let mockProfile = { drawProfiles };

  let result = mocksEngine.generateTournamentRecord(mockProfile);
  const { tournamentRecord } = result;

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  let round3MatchUps = matchUps.filter(
    ({ roundNumber, stage }) => stage === MAIN && [3].includes(roundNumber)
  );
  round3MatchUps.forEach(({ loserMatchUpId }) =>
    expect(loserMatchUpId).not.toBeUndefined()
  );
});
