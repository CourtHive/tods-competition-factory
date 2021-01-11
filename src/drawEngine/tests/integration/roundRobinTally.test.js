import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';

it('properly orders round robin participants', () => {
  const drawProfiles = [
    {
      drawSize: 3,
      eventType: SINGLES,
      participantsCount: 3,
      drawType: ROUND_ROBIN,
      outcomes: [
        {
          roundNumber: 1,
          structureIndex: 1,
          scoreString: '6-2 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          structureIndex: 1,
          scoreString: '6-2 6-2',
          winningSide: 2,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  console.log(drawDefinition.structures[0].structures[0].matchUps);
});
