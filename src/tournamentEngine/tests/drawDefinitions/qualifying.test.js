import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

test('drawProfiles which include qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      qualifyingStructures: [{ drawSize: 16, qualifyingPositions: 4 }],
    },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
});
