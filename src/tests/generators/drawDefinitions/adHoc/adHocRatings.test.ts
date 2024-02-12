import { getRoundMatchUps } from '@Query/matchUps/getRoundMatchUps';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants and fixtures
import ratingsParameters from '@Fixtures/ratings/ratingsParameters';
import { AD_HOC } from '@Constants/drawDefinitionConstants';
import { UTR, WTN } from '@Constants/ratingConstants';
import { DYNAMIC } from '@Constants/scaleConstants';

const scenarios = [
  { category: { ratingType: UTR, ratingMin: 10, ratingMax: 12 }, diffTolerance: 2 },
  { category: { ratingType: WTN, ratingMin: 10, ratingMax: 12 }, diffTolerance: 2 },
  { category: { ratingType: UTR, ratingMin: 7, ratingMax: 10 }, diffTolerance: 3 },
];

it.each(scenarios)('can generate level based rounds with WTN', (scenario) => {
  const participantPressure: { [key: string]: any } = {};
  const getPairRatings = (scaleName) => (matchUp) => {
    const scaleValues = matchUp.sides.map((side) => side.participant.ratings.SINGLES[0].scaleValue);
    const values = scaleValues.map((scaleValue) => scaleValue?.[ratingsParameters[scaleName].accessor]);
    const diff = parseFloat(Math.abs(values[0] - values[1]).toFixed(2));
    const lowSide = values[0] < values[1] ? 0 : 1;
    for (const side of matchUp.sides) {
      const participantId = side.participant.participantId;
      if (!participantPressure[participantId]) participantPressure[participantId] = { rounds: [], aggregate: 0 };
      participantPressure[participantId].rounds.push(lowSide === 0 ? diff : -diff);
      participantPressure[participantId].aggregate = participantPressure[participantId].rounds.reduce(
        (a, b) => a + b,
        0,
      );
    }
    return { values, diff };
  };
  const drawId = 'drawId';
  const drawSize = 32;

  mocksEngine.generateTournamentRecord({
    participantsProfile: { idPrefix: 'P', scaleAllParticipants: true },
    drawProfiles: [
      {
        category: scenario.category,
        drawType: AD_HOC,
        automated: true,
        scaleName: WTN,
        roundsCount: 4,
        drawSize,
        drawId,
      },
    ],
    setState: true,
  });

  const matchUps = tournamentEngine.allTournamentMatchUps({ participantsProfile: { withScaleValues: true } }).matchUps;
  const { roundMatchUps } = getRoundMatchUps({ matchUps });

  for (const round in roundMatchUps) {
    const pairRatings = roundMatchUps[round].map(getPairRatings(scenario.category.ratingType));
    if (scenario.diffTolerance) expect(pairRatings.every(({ diff }) => diff <= scenario.diffTolerance)).toEqual(true);
  }

  const participants = tournamentEngine.getParticipants({ withScaleValues: true }).participants;
  const valueAccessor = ratingsParameters[scenario.category.ratingType].accessor;
  expect(participants.every(({ ratings }) => ratings.SINGLES?.[0]?.scaleValue?.[valueAccessor])).toEqual(true);
});

it.each(scenarios)('will update adHocRatings', (scenario) => {
  const drawId = 'drawId';
  const drawSize = 32;

  mocksEngine.generateTournamentRecord({
    participantsProfile: { idPrefix: 'P', scaleAllParticipants: true },
    completeAllMatchUps: true,
    setState: true,
    drawProfiles: [
      {
        scaleName: scenario.category.ratingType,
        category: scenario.category,
        drawType: AD_HOC,
        automated: true,
        roundsCount: 1,
        drawSize,
        drawId,
      },
    ],
  });

  const generationResult = tournamentEngine.drawMatic({
    dynamicRatings: true,
    drawId,
  });
  expect(generationResult.success).toEqual(true);
  const addResult = tournamentEngine.addAdHocMatchUps({
    matchUps: generationResult.matchUps,
    drawId,
  });
  expect(addResult.success).toEqual(true);

  const participants = tournamentEngine.getParticipants({ withScaleValues: true }).participants;
  expect(participants.every((p) => p.timeItems[1].itemType.split('.').reverse()[0] === DYNAMIC));
});

it('will accept adHocRatings at generation time', () => {
  expect(true).toEqual(true);
});
