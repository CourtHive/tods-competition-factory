import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { tournamentEngine } from '@Engines/syncEngine';
import { mocksEngine } from '@Assemblies/engines/mock';
import { it, expect } from 'vitest';

// constants
import { INVALID_VALUES, MISSING_DRAW_DEFINITION } from '@Constants/errorConditionConstants';
import { AD_HOC } from '@Constants/drawDefinitionConstants';

it('can remove scores from adHoc matchUps', () => {
  const drawId = 'drawId';
  const drawSize = 8;

  mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles: [
      {
        drawType: AD_HOC,
        automated: true,
        roundsCount: 2,
        idPrefix: 'ah',
        drawSize,
        drawId,
      },
    ],
    setState: true,
  });
  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  let scoredMatchUps = matchUps.filter(checkScoreHasValue);
  // expect all of the matchUps to be scored
  expect(matchUps.length).toEqual(scoredMatchUps.length);

  let resetResult = tournamentEngine.resetAdHocMatchUps();
  expect(resetResult.error).toEqual(MISSING_DRAW_DEFINITION);

  resetResult = tournamentEngine.resetAdHocMatchUps({ drawId });
  expect(resetResult.error).toEqual(INVALID_VALUES);

  resetResult = tournamentEngine.resetAdHocMatchUps({ drawId, roundNumbers: [1] });
  expect(resetResult.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  scoredMatchUps = matchUps.filter(checkScoreHasValue);
  let unScoredMatchUps = matchUps.filter(({ score }) => !checkScoreHasValue({ score }));

  // expect only half of the matchUps to be scored
  expect(scoredMatchUps.length).toEqual(matchUps.length / 2);

  // expect participant assignments to remain
  expect(
    unScoredMatchUps.flatMap((m) => m.sides.flatMap((s) => s.participant?.participantId)).filter(Boolean).length,
  ).toEqual(drawSize);

  resetResult = tournamentEngine.resetAdHocMatchUps({ drawId, roundNumbers: [1], removeAssignments: true });
  expect(resetResult.success).toEqual(true);
  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  scoredMatchUps = matchUps.filter(checkScoreHasValue);
  unScoredMatchUps = matchUps.filter(({ score }) => !checkScoreHasValue({ score }));

  // expect all participant assignments to be removed from unscored matchUps
  expect(
    unScoredMatchUps.flatMap((m) => m.sides.flatMap((s) => s.participant?.participantId)).filter(Boolean).length,
  ).toEqual(0);

  // expect that the second round matchUps all have particpant assignments and scores
  expect(scoredMatchUps.every((matchUp) => matchUp.roundNumber === 2));
  expect(
    scoredMatchUps.flatMap((m) => m.sides.flatMap((s) => s.participant?.participantId)).filter(Boolean).length,
  ).toEqual(8);

  resetResult = tournamentEngine.resetAdHocMatchUps({ drawId, roundNumbers: [2], removeAssignments: true });
  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  scoredMatchUps = matchUps.filter(checkScoreHasValue);
  unScoredMatchUps = matchUps.filter(({ score }) => !checkScoreHasValue({ score }));

  expect(scoredMatchUps.length).toEqual(0);
  expect(unScoredMatchUps.length).toEqual(matchUps.length);
  expect(
    unScoredMatchUps.flatMap((m) => m.sides.flatMap((s) => s.participant?.participantId)).filter(Boolean).length,
  ).toEqual(0);
});
