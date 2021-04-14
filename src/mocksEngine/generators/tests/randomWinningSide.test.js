import tournamentEngine from '../../../tournamentEngine/sync';
import { instanceCount } from '../../../utilities';
import mocksEngine from '../..';

import {
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats/formatConstants';

it.each([
  [SINGLE_ELIMINATION, 16],
  [FEED_IN_CHAMPIONSHIP, 32],
  [FIRST_MATCH_LOSER_CONSOLATION, 32],
])('can complete matchUps with randomWinningSide', (drawType, drawSize) => {
  const structureOptions = { groupSize: 5 };
  const { matchUps } = generateScenario({
    structureOptions,
    drawType,
    drawSize,
  });

  const winningSides = matchUps.map(({ winningSide }) => winningSide);
  const instances = instanceCount(winningSides);
  console.log({ instances });
});

function generateScenario({ drawSize, structureOptions, drawType }) {
  const drawProfiles = [
    {
      drawSize,
      eventType: SINGLES,
      participantsCount: drawSize,
      matchUpFormat: FORMAT_STANDARD,
      structureOptions,
      drawType,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    completeAllMatchUps: true,
    randomWinningSide: true,
  });

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  return { drawDefinition, matchUps };
}
