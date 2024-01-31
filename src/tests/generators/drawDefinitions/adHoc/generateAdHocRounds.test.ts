import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

import { AD_HOC } from '../../../../constants/drawDefinitionConstants';

it('can generate multiple AD_HOC rounds', () => {
  const drawSize = 32;
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { idPrefix: 'P' },
    drawProfiles: [
      {
        drawType: AD_HOC,
        automated: true,
        roundsCount: 1,
        drawSize,
      },
    ],
    setState: true,
  });

  const matchUpsResult = tournamentEngine.allTournamentMatchUps();
  expect(matchUpsResult.matchUps.length).toEqual(Math.floor(drawSize / 2));
  expect(true).toEqual(true);

  const roundsCount = 3;
  const matchUps = tournamentEngine.generateAdHocRounds({ drawId, roundsCount }).matchUps;
  expect(matchUps.length).toEqual(roundsCount * (drawSize / 2));
});
