import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

import { COMPASS } from '../../../constants/drawDefinitionConstants';

// This should only apply when eventType is SINGLES or DOUBLES, NOT WHEN TEAM!
test('changing winningSide can propagate changes through multiple structures', () => {
  const drawSize = 32;
  const expectedMatchUpsCount = 72; // 31 + 15 + 7 + 7 + 3 + 3 + 3 + 3
  const drawProfiles = [{ drawType: COMPASS, drawSize }];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    completeAllMatchUps: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const matchUps = tournamentEngine.tournamentMatchUps();
  const { completedMatchUps, matchUpsCount } = matchUps;
  expect(completedMatchUps.length).toEqual(expectedMatchUpsCount);
  expect(matchUpsCount).toEqual(expectedMatchUpsCount);

  const firstMatchUp = completedMatchUps.find(
    ({ roundNumber, roundPosition, structureName }) =>
      roundNumber === 1 && roundPosition === 1 && structureName === 'EAST'
  );
  const firstMatchUpLoserParticipantId = firstMatchUp.sides.find(
    ({ sideNumber }) => sideNumber !== firstMatchUp.winningSide
  ).participantId;
  const westFinal = completedMatchUps.find(
    ({ finishingRound, structureName }) =>
      finishingRound === 1 && structureName === 'WEST'
  );
  const westFinalWinnerParticipantId = westFinal.sides.find(
    ({ sideNumber }) => sideNumber === westFinal.winningSide
  ).participantId;

  expect(firstMatchUpLoserParticipantId).toEqual(westFinalWinnerParticipantId);

  let result = tournamentEngine
    .devContext({ winningSideChange: true })
    .setMatchUpStatus({
      matchUpId: firstMatchUp.matchUpId,
      drawId,
      outcome: { winningSide: 2 },
    });
  console.log(result.error);
});
