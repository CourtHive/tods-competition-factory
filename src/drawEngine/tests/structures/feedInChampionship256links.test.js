import drawEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';

import {
  BOTTOM_UP,
  CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  MAIN,
  TOP_DOWN,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can properly generate feed in championship links', () => {
  const participantsProfile = {
    participantsCount: 256,
  };
  const feedPolicy = {
    roundGroupedOrder: [
      [1], // complete round TOP_DOWN
      [1], // complete round BOTTOM_UP
      [1, 2], // 1st half BOTTOM_UP, 2nd half BOTTOM_UP
      [2, 1, 4, 3], // 2nd Qtr BOTTOM_UP, 1st Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP
      [2, 1, 4, 3, 6, 5, 8, 7], // 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP
      [1], // complete round BOTTOM_UP
    ],
    roundFeedProfiles: [
      TOP_DOWN,
      BOTTOM_UP,
      BOTTOM_UP,
      BOTTOM_UP,
      BOTTOM_UP,
      BOTTOM_UP,
      BOTTOM_UP,
      BOTTOM_UP,
    ],
  };
  const drawProfiles = [
    {
      drawSize: 256,
      eventType: SINGLES,
      participantsCount: 256,
      drawType: FEED_IN_CHAMPIONSHIP,
      feedPolicy,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-4',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 5,
          scoreString: '6-1 6-4',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 6,
          scoreString: '6-1 7-5',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 7,
          scoreString: '6-1 7-6(6)',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 8,
          scoreString: '6-1 7-6(7)',
          winningSide: 1,
        },
        // 2nd round main draw
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 2,
          scoreString: '6-2 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 3,
          scoreString: '6-2 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 4,
          scoreString: '6-2 6-4',
          winningSide: 1,
        },
        // 3rd round main draw
        {
          roundNumber: 3,
          roundPosition: 1,
          scoreString: '6-3 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 3,
          roundPosition: 2,
          scoreString: '6-3 6-2',
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.links.length).toEqual(8);
  drawDefinition.links.forEach((link) => {
    expect(link.target.feedProfile).not.toBeUndefined();
  });

  const { matchUps: mainDrawMatchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
    contextFilters: { stages: [MAIN] },
  });

  const { roundMatchUps: mainDrawRoundMatchUps } = drawEngine.getRoundMatchUps({
    matchUps: mainDrawMatchUps,
  });

  const { matchUps: consolationMatchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
    contextFilters: { stages: [CONSOLATION] },
  });

  const {
    roundMatchUps: consolationRoundMatchUps,
  } = drawEngine.getRoundMatchUps({
    matchUps: consolationMatchUps,
  });

  const sourceRangeExpectations = [
    [1, 1, '1-2', '3-4'],
    [2, 64, '1-4'],
    [2, 64, '1-4'],
    [4, 1, '121-128'],
    [4, 16, '1-8'],
    [4, 17, '249-256'],
    [4, 32, '129-136'],
  ];
  sourceRangeExpectations.forEach(
    ([roundNumber, roundPosition, side1Range, side2Range]) => {
      const matchUp = consolationRoundMatchUps[roundNumber].find((matchUp) => {
        return matchUp.roundPosition === roundPosition;
      });
      if (side1Range) {
        expect(matchUp.sides[0].sourceDrawPositionRange).toEqual(side1Range);
      }
      if (side2Range) {
        expect(matchUp.sides[1].sourceDrawPositionRange).toEqual(side2Range);
      }
    }
  );

  const directedLoserParticipantIdExpectations = [[3, 1, 4, 16]];

  directedLoserParticipantIdExpectations.forEach(
    ([
      sourceRoundNumber,
      sourceRoundPosition,
      targetRoundNumber,
      targetRoundPosition,
    ]) => {
      const sourceMatchUp = mainDrawRoundMatchUps[sourceRoundNumber].find(
        (matchUp) => matchUp.roundPosition === sourceRoundPosition
      );
      const sourceLosingParticipantId = sourceMatchUp.sides.find(
        ({ sideNumber }) => sideNumber !== sourceMatchUp.winningSide
      ).participantId;
      const targetMatchUp = consolationRoundMatchUps[targetRoundNumber].find(
        (matchUp) => matchUp.roundPosition === targetRoundPosition
      );
      const targetFedParticipantId = targetMatchUp.sides.find(
        ({ sideNumber }) => sideNumber === 1
      ).participantId;

      expect(sourceLosingParticipantId).toEqual(targetFedParticipantId);
    }
  );

  /*
  // NOTE: visual check can be turned into further tests...
  const checkRounds = [8, 10];
  const visualCheck = [];
  Object.keys(consolationRoundMatchUps).forEach((roundNumber) => {
    if (!checkRounds.includes(parseInt(roundNumber))) return;
    consolationRoundMatchUps[roundNumber].forEach((matchUp) => {
      const side1Range = matchUp.sides[0].sourceDrawPositionRange;
      if (roundNumber > 1 && side1Range)
        visualCheck.push([
          { roundNumber, roundPosition: matchUp.roundPosition, side1Range },
        ]);
    });
  });
  console.log(visualCheck);
  */
});
