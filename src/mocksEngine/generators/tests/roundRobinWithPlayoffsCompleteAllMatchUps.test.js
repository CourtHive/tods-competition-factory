import tournamentEngine from '../../../tournamentEngine/sync';
import { instanceCount } from '../../../utilities';
import mocksEngine from '../..';

import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats/formatConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

it('can complete matchUps in playoff structures', () => {
  const structureOptions = { groupSize: 5 };
  let { matchUps } = generateScenario({
    structureOptions,
    drawSize: 20,
  });

  const matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[COMPLETED]).toEqual(matchUps.length);

  // get matchUps that are in the Round Robin
  // in this scenario those are MAIN stage; they could also be found by filtering for no roundPosition
  ({ matchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [MAIN] },
  }));

  const targetMatchUp = matchUps[0];
  const { drawId, matchUpId } = targetMatchUp;
  const winningSide = 3 - targetMatchUp.winningSide;

  // generate an outcome that changes the winning side
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide,
  });

  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });

  console.log(result);
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
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    completeAllMatchUps: true,
  });

  const { drawDefinition } = tournamentEngine
    .setState(tournamentRecord)
    .getEvent({ drawId });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  return { drawDefinition, matchUps };
}
