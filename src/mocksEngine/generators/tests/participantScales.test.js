import { getParticipantId } from '../../../global/functions/extractors';
import { tournamentEngine } from '../../..';
import mocksEngine from '../..';

// prettier-ignore
const rankingsScenarios = [
  { category: { categoryName: 'U18' }, expectation: { timeItem: { itemType: 'SCALE.RANKING.SINGLES.U18' } }},
  { category: { categoryName: '18U' }, expectation: { timeItem: { itemType: 'SCALE.RANKING.SINGLES.18U' } }},
  { category: { ratingType: 'WTN' }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.WTN' } }},
  { category: { ratingType: 'UTR' }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.UTR' } }},
  { category: { ratingType: 'NTRP' }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.NTRP' } }},
  { category: { ratingType: 'WTN', ratingMin: 5, ratingMax: 8 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.WTN' } }},
  { category: { ratingType: 'WTN', ratingMin: 8, ratingMax: 9 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.WTN' } }},
  { category: { ratingType: 'UTR', ratingMin: 9, ratingMax: 13 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.UTR' } }},
  { category: { ratingType: 'ELO', ratingMin: 1200, ratingMax: 1400 }, expectation: { timeItem: { itemType: 'SCALE.RATING.SINGLES.ELO' } }},
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

    if (scenario.expectation.timeItem) {
      const timeItem = participant.timeItems[0];
      expect(timeItem.itemType).toEqual(scenario.expectation.timeItem.itemType);
      const { ratingMin, ratingMax } = scenario.category;
      if (ratingMin && ratingMax) {
        expect(timeItem.itemValue).toBeLessThanOrEqual(ratingMax);
        expect(timeItem.itemValue).toBeGreaterThanOrEqual(ratingMin);
      }
    }
  }
);

const ratingType = 'WTN';
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
