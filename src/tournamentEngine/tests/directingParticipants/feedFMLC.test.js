import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../..';

import {
  FIRST_MATCH_LOSER_CONSOLATION,
  TOP_DOWN,
} from '../../../constants/drawDefinitionConstants';

it('Feeds both consolation rounds TOP_DOWN', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      participantsCount: 15,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.links.length).toEqual(2);
  drawDefinition.links.forEach((link) =>
    expect(link.target.feedProfile).toEqual(TOP_DOWN)
  );

  expect('foo');
});
