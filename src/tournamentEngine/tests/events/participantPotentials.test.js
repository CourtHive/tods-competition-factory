import tournamentEngine from '../../sync';
import { generateTournamentRecord } from '../../../mocksEngine/generators/generateTournamentRecord';
import drawEngine from '../../../drawEngine/sync';

it('can return event matchUps with potential participants', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
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

  const winnerMatchUpId = roundMatchUps[2][0].winnerMatchUpId;
  const winnerToMatchUpId = roundMatchUps[2][0].winnerTo.matchUpId;
  const firstPositionSecondRoundMatchUpId = roundMatchUps[3][0].matchUpId;
  expect(winnerMatchUpId).toEqual(winnerToMatchUpId);
  expect(winnerMatchUpId).toEqual(firstPositionSecondRoundMatchUpId);

  // expect the potentialParticipants for the 2nd round match to include 1st round participants
  expect(
    roundMatchUps[1][1].sides.map(({ participant }) => participant)
  ).toEqual(roundMatchUps[2][0].potentialParticipants[0]);
});
