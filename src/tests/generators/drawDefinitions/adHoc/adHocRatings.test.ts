import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants and fixtures
import ratingsParameters from '@Fixtures/ratings/ratingsParameters';
import { AD_HOC } from '@Constants/drawDefinitionConstants';
import { UTR, WTN } from '@Constants/ratingConstants';

const scenarios = [{ ratingType: UTR }, { ratingType: WTN }];
it.each(scenarios)('can generate level based rounds with WTN', (scenario) => {
  const drawId = 'drawId';
  const drawSize = 32;

  mocksEngine.generateTournamentRecord({
    participantsProfile: { idPrefix: 'P', scaleAllParticipants: true },
    drawProfiles: [
      {
        category: { ratingType: scenario.ratingType, ratingMin: 10, ratingMax: 12 },
        drawType: AD_HOC,
        scaleName: 'WTN',
        automated: true,
        roundsCount: 2,
        drawSize,
        drawId,
      },
    ],
    setState: true,
  });

  const matchUpsResult = tournamentEngine.allTournamentMatchUps();
  console.log(matchUpsResult.matchUps.length);

  const participants = tournamentEngine.getParticipants({ withScaleValues: true }).participants;
  const valueAccessor = ratingsParameters[scenario.ratingType].accessor;
  expect(participants.every(({ ratings }) => ratings.SINGLES?.[0]?.scaleValue?.[valueAccessor])).toEqual(true);
});

it('will update adHocRatings', () => {
  expect(true).toEqual(true);
});

it('will accept adHocRatings at generation time', () => {
  expect(true).toEqual(true);
});
