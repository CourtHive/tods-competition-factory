import tournamentEngine from '../../sync';
import { generateTournamentRecord } from '../../../mocksEngine/generators/generateTournamentRecord';
import drawEngine from '../../../drawEngine/sync';
import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

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
  const firstPositionThirdRoundMatchUpId = roundMatchUps[3][0].matchUpId;
  expect(winnerMatchUpId).toEqual(winnerToMatchUpId);
  expect(winnerMatchUpId).toEqual(firstPositionThirdRoundMatchUpId);

  // expect the potentialParticipants for the 2nd round match to include 1st round participants
  expect(
    roundMatchUps[1][1].sides.map(({ participant }) => participant)
  ).toEqual(roundMatchUps[2][0].potentialParticipants[0]);
});

it('handles potential BYES for FMLC consolation structures', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      participantsCount: 14,
    },
  ];
  const { tournamentRecord } = generateTournamentRecord({
    drawProfiles,
    inContext: true,
    goesTo: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    nextMatchUps: true,
  });

  const consolationMatchUps = matchUps.filter(
    ({ stage }) => stage === CONSOLATION
  );
  const { roundMatchUps } = drawEngine.getRoundMatchUps({
    matchUps: consolationMatchUps,
  });
  expect(roundMatchUps[1][0].potentialParticipants[1][1]).toEqual({
    bye: true,
  });
  expect(roundMatchUps[2][0].potentialParticipants[1][0]).toEqual({
    bye: true,
  });
});

it('removes potential participants when side participant is known', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = generateTournamentRecord({
    drawProfiles,
    inContext: true,
    goesTo: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    nextMatchUps: true,
  });

  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });
  expect(
    roundMatchUps[2][0].sides.filter(({ sideNumber }) => sideNumber).length
  ).toEqual(1);
  expect(roundMatchUps[2][0].potentialParticipants.length).toEqual(1);

  expect(
    roundMatchUps[2][1].sides.filter(({ sideNumber }) => sideNumber).length
  ).toEqual(0);
  expect(roundMatchUps[2][1].potentialParticipants.length).toEqual(2);
});
