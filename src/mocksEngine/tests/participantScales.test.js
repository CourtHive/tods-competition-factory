import { getParticipantId } from '../../global/functions/extractors';
import { tournamentEngine } from '../..';
import mocksEngine from '..';

import ratingsParameters from '../../fixtures/ratings/ratingsParameters';
import { ELO, NTRP, UTR, WTN } from '../../constants/ratingConstants';
import { SINGLES } from '../../constants/matchUpTypes';
import { mockProfile } from './mockScaleProfile';

// prettier-ignore
const rankingsScenarios = [
  { category: { categoryName: 'U18' }, expectation: { timeItem: { itemType: 'SCALE.RANKING.SINGLES.U18' } }},
  { category: { categoryName: '18U' }, expectation: { timeItem: { itemType: 'SCALE.RANKING.SINGLES.18U' } }},
  { category: { ratingType: WTN }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.WTN' }, accessor: true }},
  { category: { ratingType: UTR }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.UTR' } }},
  { category: { ratingType: NTRP }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.NTRP' }, accessor: true }},
  { category: { ratingType: WTN, ratingMin: 5, ratingMax: 8 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.WTN' }, accessor: true }},
  { category: { ratingType: WTN, ratingMin: 8, ratingMax: 9 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.WTN' }, accessor: true }},
  { category: { ratingType: UTR, ratingMin: 9, ratingMax: 13 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.UTR' } }},
  { category: { ratingType: ELO, ratingMin: 1200, ratingMax: 1400 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.ELO' } }},
];

test.each(rankingsScenarios)(
  'it can generate rankings for participants',
  (scenario) => {
    const participantsProfile = {
      category: scenario.category,
      participantsCount: 1,
    };

    const {
      participants: [participant],
    } = mocksEngine.generateParticipants(participantsProfile);

    if (scenario.expectation.timeItem && participant.timeItems?.length) {
      const timeItem = participant.timeItems[0];
      expect(timeItem.itemType).toEqual(scenario.expectation.timeItem.itemType);
      const { ratingMin, ratingMax, ratingType } = scenario.category;
      const accessor = ratingsParameters[ratingType]?.accessor;
      const itemValue = timeItem.itemValue;
      const value = accessor ? itemValue[accessor] : itemValue;

      expect(value).not.toBeUndefined();

      if (ratingMin && ratingMax) {
        expect(value).toBeLessThanOrEqual(ratingMax);
        expect(value).toBeGreaterThanOrEqual(ratingMin);
      }
    } else {
      // ratingMin and ratingMax are close and there is a chance no random values fall into the range
      expect([ELO, WTN].includes(ratingType)).toEqual(true);
    }
  }
);

const ratingType = WTN;
const categoryName = '12U';

// prettier-ignore
const mockScenarios = [
   { drawProfiles: [{ drawSize: 4, category: { categoryName }, rankingRange: [1, 15] }], expectation: { itemType: 'SCALE.RANKING.SINGLES.12U' }},
   { eventProfiles: [{ drawProfiles: [{ drawSize: 4 }], category: { categoryName }, rankingRange: [1, 15] }], expectation: { itemType: 'SCALE.RANKING.SINGLES.12U' }},
   { drawProfiles: [{ drawSize: 4, category: { ratingType }, rankingRange: [1, 15] }], expectation: { itemType: 'SCALE.RATING.SINGLES.WTN' }},
   { eventProfiles: [{ drawProfiles: [{ drawSize: 4 }], category: { ratingType }, rankingRange: [1, 15] }], expectation: { itemType: 'SCALE.RATING.SINGLES.WTN' }}
];

it.each(mockScenarios)(
  'can generate events with scaled participants',
  (scenario) => {
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord(scenario);
    tournamentEngine.setState(tournamentRecord);

    const {
      drawDefinition: {
        structures: [{ structureId }],
      },
    } = tournamentEngine.getEvent({ drawId });
    const { positionAssignments } = tournamentEngine.getPositionAssignments({
      structureId,
      drawId,
    });
    const participantIds = positionAssignments.map(getParticipantId);
    const { tournamentParticipants } =
      tournamentEngine.getTournamentParticipants({
        participantFilters: { participantIds },
      });
    tournamentParticipants.forEach(({ timeItems }) => {
      const { itemValue, itemType } = timeItems[0];
      expect(itemType).toEqual(scenario.expectation.itemType);
      expect(itemValue).not.toBeUndefined();
    });
  }
);

// testing that NTRP values can be generated with a "step" of "0.5"
test('generates participants with rankings and ratings with additional embellishments', () => {
  const { tournamentRecord, eventIds } =
    mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  const tournamentParticipantsCount = tournamentParticipants.length;

  const scaleItems = tournamentParticipants
    .map(
      (p) =>
        p.timeItems && p.timeItems.filter((i) => i.itemType.startsWith('SCALE'))
    )
    .filter(Boolean)
    .flat();

  let typesCount = 0;
  expect(scaleItems.length).toEqual(tournamentParticipantsCount);

  scaleItems.forEach(({ itemType, itemValue }) => {
    if (itemType === 'SCALE.RANKING.SINGLES.U18') {
      expect(itemValue).toEqual(Math.round(itemValue));
      typesCount += 1;
    } else if (itemType === 'SCALE.RATING.SINGLES.WTN') {
      const decimalValue = itemValue.wtnRating.toString().split('.')[1];
      decimalValue &&
        expect([1, 2].includes(decimalValue?.length)).toEqual(true);
      typesCount += 1;
    } else if (itemType === 'SCALE.RATING.SINGLES.NTRP') {
      const decimalValue = itemValue.ntrpRating.toString().split('.')[1];
      if (decimalValue) expect(decimalValue).toEqual('5');
      typesCount += 1;
    }
  });
  expect(typesCount).toEqual(scaleItems.length);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    inContext: true,
    withISO: true,
  }));

  let withRatings = 0;
  let withRankings = 0;
  tournamentParticipants.forEach((participant) => {
    if (participant.rankings) {
      withRankings += 1;
      expect(participant.rankings[SINGLES].length).toEqual(1);
    }
    if (participant.ratings) {
      withRatings += 1;
      expect(participant.ratings[SINGLES].length).toEqual(1);
    }
  });
  expect(withRankings).toEqual(8);
  expect(withRatings).toEqual(16);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventIds: [eventIds[0]] },
    inContext: true,
    withISO: true,
  }));

  expect(tournamentParticipants.length).toEqual(8);
});
