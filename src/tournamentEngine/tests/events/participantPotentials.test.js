import { generateTournamentRecord } from '../../../mocksEngine/generators/generateTournamentRecord';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { DOUBLES_EVENT } from '../../../constants/eventConstants';
import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

it('can return event matchUps with potential participants', () => {
  const drawProfiles = [
    {
      participantsCount: 6,
      drawSize: 8,
    },
  ];
  const { drawIds, tournamentRecord } = generateTournamentRecord({
    inContext: true,
    drawProfiles,
    goesTo: true,
  });

  const drawId = drawIds[0];

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    nextMatchUps: true,
    drawId,
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

it('participant object include potentials', () => {
  const drawProfiles = [
    {
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      eventType: DOUBLES_EVENT,
      drawSize: 8,
    },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  const { participants } = tournamentEngine.getParticipants({
    withPotentialMatchUps: true,
    withMatchUps: true,
  });
  expect(participants.length).toEqual(
    participants.map((p) => p.potentialMatchUps).filter(Boolean).length
  );
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
  expect(roundMatchUps[2][0].potentialParticipants[0][1].bye).toEqual(true);
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
