import tournamentEngine from '../../../tournamentEngine/sync';
import { instanceCount } from '../../../utilities';
import mocksEngine from '../..';

import { ROUND_ROBIN_WITH_PLAYOFF } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats/formatConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';

it('can complete matchUps in playoff structures', () => {
  const structureOptions = { groupSize: 5 };
  const { matchUps } = generateScenario({
    structureOptions,
    drawSize: 20,
  });

  const matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[COMPLETED]).toEqual(matchUps.length);
});

function generateScenario({ drawSize, structureOptions }) {
  const drawProfiles = [
    {
      drawSize,
      eventType: SINGLES,
      participantsCount: drawSize,
      matchUpFormat: FORMAT_STANDARD,
      drawType: ROUND_ROBIN_WITH_PLAYOFF,
      structureOptions,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    completeAllMatchUps: true,
  });

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  return { drawDefinition, matchUps };
}
