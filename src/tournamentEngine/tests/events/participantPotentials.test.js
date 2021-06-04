import tournamentEngine from '../../sync';
import { generateTournamentRecord } from '../../../mocksEngine/generators/generateTournamentRecord';
import drawEngine from '../../../drawEngine/sync';

it('can return event matchUps with potential participants', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const { drawIds, tournamentRecord } = generateTournamentRecord({
    drawProfiles,
    inContext: true,
    goesTo: true,
  });

  const drawId = drawIds[0];

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    nextMatchUps: true,
  });

  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });

  const winnerMatchUpId = roundMatchUps[1][0].winnerMatchUpId;
  const winnerToMatchUpId = roundMatchUps[1][0].winnerTo.matchUpId;
  const firstPositionSecondRoundMatchUpId = roundMatchUps[2][0].matchUpId;
  expect(winnerMatchUpId).toEqual(winnerToMatchUpId);
  expect(winnerMatchUpId).toEqual(firstPositionSecondRoundMatchUpId);
});
