import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';

import { FEED_IN_CHAMPIONSHIP } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can properly generate feed in championship links', () => {
  const participantsProfile = {
    participantsCount: 256,
  };
  const drawProfiles = [
    {
      drawSize: 256,
      eventType: SINGLES,
      participantsCount: 256,
      drawType: FEED_IN_CHAMPIONSHIP,
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
  // drawDefinition.links.forEach((link) => console.log(link));

  // let [mainStructure, consolationStructure] = drawDefinition.structures;
});
