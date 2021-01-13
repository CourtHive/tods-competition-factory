import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';

import {
  BOTTOM_UP,
  CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
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
      [1, 2, 3, 4], // 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP
      [1], // complete round BOTTOM_UP
    ],
    roundFeedProfiles: [
      TOP_DOWN,
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
      /*
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
      */
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

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });
  const consolationMatchUps = matchUps.filter(
    (matchUp) => matchUp.stage === CONSOLATION
  );

  const check = consolationMatchUps.map(
    ({
      roundNumber,
      roundPosition,
      drawPositionsRange: { firstRoundOffsetDrawPositionsRange },
    }) => ({ roundNumber, roundPosition, firstRoundOffsetDrawPositionsRange })
  );
  console.log(check[0]);
  console.log(check[127]);
});
