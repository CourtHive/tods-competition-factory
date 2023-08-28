import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';
import { expect, test } from 'vitest';

import ratingsParameters from '../../../../fixtures/ratings/ratingsParameters';
import { NTRP, UTR, WTN } from '../../../../constants/ratingConstants';

const scenarios = [
  {},
  { considerGames: true },
  { ratingType: UTR },
  { ratingType: WTN },
  { ratingType: NTRP },
  { asDynamic: true },
  { ratingType: UTR, asDynamic: true },
  { ratingType: WTN, asDynamic: true },
  { ratingType: NTRP, asDynamic: true },
];

test.each(scenarios)(
  'it can calculate new ratings given matchUp results',
  (scenario) => {
    const { considerGames, ratingType, asDynamic } = scenario;
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize: 8 }],
      completeAllMatchUps: true,
      randomWinningSide: true,
    });

    tournamentEngine.setState(tournamentRecord);

    const { matchUps } = tournamentEngine.allTournamentMatchUps();
    expect(matchUps.length).toEqual(7);

    const matchUpIds = matchUps.map(({ matchUpId }) => matchUpId);
    const result = scaleEngine.processMatchUps({
      considerGames,
      matchUpIds,
      ratingType,
      asDynamic,
    });
    expect(result.success).toEqual(true);
    expect(result.processedMatchUpIds.length).toEqual(matchUpIds.length);

    const { tournamentParticipants } =
      tournamentEngine.getTournamentParticipants({
        withStatistics: true,
        withMatchUps: true,
      });

    for (const participant of tournamentParticipants) {
      expect(participant.timeItems.length).toEqual(
        participant.statistics[0].denominator
      );
      if (asDynamic) {
        const accessor = ratingType && ratingsParameters[ratingType]?.accessor;
        participant.timeItems.forEach((timeItem) => {
          const { itemType, itemValue } = timeItem;
          expect(typeof itemValue).toEqual(accessor ? 'object' : 'string');
          expect(
            accessor ? itemValue[accessor] : itemValue
          ).not.toBeUndefined();
          expect(itemType.split('.').reverse()[0]).toEqual('DYNAMIC');
        });
      }
    }
  }
);
