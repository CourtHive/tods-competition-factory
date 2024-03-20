import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, test } from 'vitest';

// constants
import { SWAP_PARTICIPANTS } from '@Constants/positionActionConstants';
import { AD_HOC } from '@Constants/drawDefinitionConstants';

test('adHocMatchUpActions', () => {
  const drawId = 'did';
  const drawProfile = {
    completionGoal: 10,
    drawType: AD_HOC,
    automated: true,
    roundsCount: 2,
    drawSize: 16,
    idPrefix: 'm',
    drawId,
  };

  mocksEngine.generateTournamentRecord({ drawProfiles: [drawProfile], setState: true });

  const methods = [
    {
      method: 'positionActions',
      params: {
        structureId: `${drawId}-s-0`,
        matchUpId: `${drawId}-m-2-2`,
        sideNumber: 1,
        drawId,
      },
    },
  ];

  const result = tournamentEngine.executionQueue(methods);
  expect(result.success).toBe(true);
  const swapAction = result.results[0].validActions.find((action) => action.type === SWAP_PARTICIPANTS);
  expect([9, 10].includes(swapAction.swappableParticipantIds.length)).toBe(true);
});
