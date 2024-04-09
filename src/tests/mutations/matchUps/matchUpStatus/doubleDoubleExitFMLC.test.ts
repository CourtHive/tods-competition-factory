import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

// constants
import { FIRST_MATCH_LOSER_CONSOLATION } from '@Constants/drawDefinitionConstants';
import { BYE, DOUBLE_DEFAULT, TO_BE_PLAYED } from '@Constants/matchUpStatusConstants';

test('removing one of two adjacent double exits will preserve propagated BYE', () => {
  const drawId = 'did';
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_MATCH_LOSER_CONSOLATION,
        idPrefix: 'FMLC',
        drawSize: 8,
        drawId,
        outcomes: [
          {
            matchUpStatus: DOUBLE_DEFAULT,
            roundPosition: 1,
            roundNumber: 1,
          },
          {
            matchUpStatus: DOUBLE_DEFAULT,
            roundPosition: 2,
            roundNumber: 1,
          },
        ],
      },
    ],
    setState: true,
  });
  expect(result.success).toBe(true);

  result = tournamentEngine.findMatchUp({ drawId, matchUpId: 'FMLC-c-2-1' }).matchUp;
  expect(result.matchUpStatus).toBe(BYE);

  result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: TO_BE_PLAYED },
    matchUpId: 'FMLC-1-2',
    drawId,
  });
  expect(result.success).toBe(true);

  result = tournamentEngine.findMatchUp({ drawId, matchUpId: 'FMLC-c-2-1' }).matchUp;
  expect(result.matchUpStatus).toBe(BYE);
});
