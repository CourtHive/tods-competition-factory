import { generateRankingList } from '@Query/scales/generateRankingList';
import { getParticipantPoints } from '@Query/scales/getParticipantPoints';
import { describe, expect, it } from 'vitest';

import { SINGLES, DOUBLES } from '@Constants/eventConstants';

// Helper to create test PointAwards
function makeAward(overrides: Record<string, any> = {}) {
  return {
    personId: 'person-1',
    eventType: SINGLES,
    positionPoints: 0,
    perWinPoints: 0,
    bonusPoints: 0,
    points: 0,
    level: 3,
    endDate: '2025-06-01',
    ...overrides,
  };
}

describe('generateRankingList', () => {
  it('ranks participants by total points', () => {
    const awards = [
      makeAward({ personId: 'p1', points: 900 }),
      makeAward({ personId: 'p2', points: 1200 }),
      makeAward({ personId: 'p3', points: 600 }),
    ];

    const result = generateRankingList({ pointAwards: awards });
    expect(result.length).toEqual(3);
    expect(result[0].personId).toEqual('p2');
    expect(result[0].rank).toEqual(1);
    expect(result[1].personId).toEqual('p1');
    expect(result[1].rank).toEqual(2);
    expect(result[2].personId).toEqual('p3');
    expect(result[2].rank).toEqual(3);
  });

  it('applies rolling period filter', () => {
    const awards = [
      makeAward({ personId: 'p1', points: 500, endDate: '2025-06-01' }),
      makeAward({ personId: 'p1', points: 300, endDate: '2024-01-01' }), // old, should be excluded
      makeAward({ personId: 'p2', points: 400, endDate: '2025-05-01' }),
    ];

    const result = generateRankingList({
      pointAwards: awards,
      aggregationRules: { rollingPeriodDays: 365 },
      asOfDate: '2025-07-01',
    });

    // p1 should only have the 500pt result (300pt is older than 365 days from 2025-07-01)
    const p1 = result.find((e) => e.personId === 'p1');
    expect(p1?.totalPoints).toEqual(500);
    expect(p1?.countingResults.length).toEqual(1);
  });

  it('applies bestOfCount with counting buckets', () => {
    // Simulate a participant with 10 singles results
    const singlesAwards = Array.from({ length: 10 }, (_, i) =>
      makeAward({
        personId: 'p1',
        eventType: SINGLES,
        points: (10 - i) * 100,
        positionPoints: (10 - i) * 100,
      }),
    );

    const result = generateRankingList({
      pointAwards: singlesAwards,
      aggregationRules: {
        countingBuckets: [
          {
            bucketName: 'Singles',
            eventTypes: [SINGLES],
            pointComponents: ['positionPoints', 'perWinPoints', 'bonusPoints'],
            bestOfCount: 6,
          },
        ],
      },
    });

    const p1 = result.find((e) => e.personId === 'p1');
    expect(p1?.bucketBreakdown?.[0].countingResults.length).toEqual(6);
    expect(p1?.bucketBreakdown?.[0].droppedResults.length).toEqual(4);
    // Best 6: 1000 + 900 + 800 + 700 + 600 + 500 = 4500
    expect(p1?.totalPoints).toEqual(4500);
  });

  it('applies tiebreaker: highestSingleResult', () => {
    const awards = [
      makeAward({ personId: 'p1', points: 500 }),
      makeAward({ personId: 'p1', points: 200 }),
      makeAward({ personId: 'p2', points: 400 }),
      makeAward({ personId: 'p2', points: 300 }),
    ];
    // p1 total = 700, p2 total = 700 → tie
    // p1 highest single = 500, p2 highest single = 400 → p1 wins tiebreaker

    const result = generateRankingList({
      pointAwards: awards,
      aggregationRules: {
        tiebreakCriteria: ['highestSingleResult'],
      },
    });

    expect(result[0].personId).toEqual('p1');
    expect(result[0].rank).toEqual(1);
    expect(result[1].personId).toEqual('p2');
    expect(result[1].rank).toEqual(2);
  });

  it('assigns tied ranks when tiebreakers are exhausted', () => {
    const awards = [
      makeAward({ personId: 'p1', points: 500 }),
      makeAward({ personId: 'p2', points: 500 }),
      makeAward({ personId: 'p3', points: 300 }),
    ];

    const result = generateRankingList({ pointAwards: awards });

    expect(result[0].rank).toEqual(1);
    expect(result[1].rank).toEqual(1); // tied
    expect(result[2].rank).toEqual(3);
  });

  it('flags entries below minCountableResults', () => {
    const awards = [
      makeAward({ personId: 'p1', points: 500 }),
      makeAward({ personId: 'p2', points: 300 }),
      makeAward({ personId: 'p2', points: 200 }),
      makeAward({ personId: 'p2', points: 100 }),
    ];

    const result = generateRankingList({
      pointAwards: awards,
      aggregationRules: { minCountableResults: 3 },
    });

    const p1 = result.find((e) => e.personId === 'p1');
    expect(p1?.meetsMinimum).toEqual(false); // only 1 result

    const p2 = result.find((e) => e.personId === 'p2');
    expect(p2?.meetsMinimum).toEqual(true); // 3 results
  });

  it('applies maxResultsPerLevel', () => {
    const awards = [
      makeAward({ personId: 'p1', points: 100, level: 7 }),
      makeAward({ personId: 'p1', points: 90, level: 7 }),
      makeAward({ personId: 'p1', points: 80, level: 7 }), // should be dropped
      makeAward({ personId: 'p1', points: 500, level: 3 }),
    ];

    const result = generateRankingList({
      pointAwards: awards,
      aggregationRules: {
        maxResultsPerLevel: { 7: 2 },
      },
    });

    const p1 = result.find((e) => e.personId === 'p1');
    // 500 + 100 + 90 = 690 (only 2 L7 results counted)
    expect(p1?.totalPoints).toEqual(690);
    expect(p1?.countingResults.length).toEqual(3);
    expect(p1?.droppedResults.length).toEqual(1);
  });

  it('handles multi-bucket aggregation (USTA-style)', () => {
    const awards = [
      // 8 singles results
      ...Array.from({ length: 8 }, (_, i) =>
        makeAward({
          personId: 'p1',
          eventType: SINGLES,
          points: (8 - i) * 100,
          positionPoints: (8 - i) * 80,
          perWinPoints: (8 - i) * 20,
        }),
      ),
      // 3 doubles results
      ...Array.from({ length: 3 }, (_, i) =>
        makeAward({
          personId: 'p1',
          eventType: DOUBLES,
          points: (3 - i) * 50,
          positionPoints: (3 - i) * 40,
          perWinPoints: (3 - i) * 10,
        }),
      ),
      // quality win
      makeAward({ personId: 'p1', qualityWinPoints: 225 }),
    ];

    const result = generateRankingList({
      pointAwards: awards,
      aggregationRules: {
        countingBuckets: [
          {
            bucketName: 'Singles',
            eventTypes: [SINGLES],
            pointComponents: ['positionPoints', 'perWinPoints', 'bonusPoints'],
            bestOfCount: 6,
          },
          {
            bucketName: 'Doubles',
            eventTypes: [DOUBLES],
            pointComponents: ['positionPoints', 'perWinPoints', 'bonusPoints'],
            bestOfCount: 2,
          },
          {
            bucketName: 'Quality Wins',
            pointComponents: ['qualityWinPoints'],
            bestOfCount: 0,
          },
        ],
      },
    });

    const p1 = result.find((e) => e.personId === 'p1');
    expect(p1?.bucketBreakdown?.length).toEqual(3);

    const singlesBucket = p1?.bucketBreakdown?.find((b) => b.bucketName === 'Singles');
    expect(singlesBucket?.countingResults.length).toEqual(6);
    // Best 6 singles: 800+700+600+500+400+300 = 3300
    expect(singlesBucket?.bucketTotal).toEqual(3300);

    const doublesBucket = p1?.bucketBreakdown?.find((b) => b.bucketName === 'Doubles');
    expect(doublesBucket?.countingResults.length).toEqual(2);
    // Best 2 doubles: 150+100 = 250
    expect(doublesBucket?.bucketTotal).toEqual(250);

    const qwBucket = p1?.bucketBreakdown?.find((b) => b.bucketName === 'Quality Wins');
    expect(qwBucket?.bucketTotal).toEqual(225);

    expect(p1?.totalPoints).toEqual(3300 + 250 + 225);
  });
});

describe('getParticipantPoints', () => {
  it('returns per-participant breakdown with counting buckets', () => {
    const awards = [
      makeAward({ personId: 'p1', eventType: SINGLES, positionPoints: 500, points: 500 }),
      makeAward({ personId: 'p1', eventType: SINGLES, positionPoints: 300, points: 300 }),
      makeAward({ personId: 'p1', eventType: SINGLES, positionPoints: 200, points: 200 }),
      makeAward({ personId: 'p1', eventType: DOUBLES, positionPoints: 100, points: 100 }),
      makeAward({ personId: 'p2', eventType: SINGLES, positionPoints: 900, points: 900 }),
    ];

    const result = getParticipantPoints({
      pointAwards: awards,
      personId: 'p1',
      aggregationRules: {
        countingBuckets: [
          {
            bucketName: 'Singles',
            eventTypes: [SINGLES],
            pointComponents: ['positionPoints'],
            bestOfCount: 2,
          },
          {
            bucketName: 'Doubles',
            eventTypes: [DOUBLES],
            pointComponents: ['positionPoints'],
            bestOfCount: 1,
          },
        ],
      },
    });

    expect(result.buckets.length).toEqual(2);
    expect(result.buckets[0].bucketName).toEqual('Singles');
    expect(result.buckets[0].countingResults.length).toEqual(2);
    expect(result.buckets[0].droppedResults.length).toEqual(1);
    expect(result.buckets[0].bucketTotal).toEqual(800); // 500 + 300

    expect(result.buckets[1].bucketName).toEqual('Doubles');
    expect(result.buckets[1].countingResults.length).toEqual(1);
    expect(result.buckets[1].bucketTotal).toEqual(100);

    expect(result.totalPoints).toEqual(900); // 800 + 100
  });

  it('returns single "All" bucket without counting buckets', () => {
    const awards = [
      makeAward({ personId: 'p1', points: 500 }),
      makeAward({ personId: 'p1', points: 300 }),
      makeAward({ personId: 'p1', points: 100 }),
    ];

    const result = getParticipantPoints({
      pointAwards: awards,
      personId: 'p1',
      aggregationRules: { bestOfCount: 2 },
    });

    expect(result.buckets.length).toEqual(1);
    expect(result.buckets[0].bucketName).toEqual('All');
    expect(result.buckets[0].countingResults.length).toEqual(2);
    expect(result.buckets[0].droppedResults.length).toEqual(1);
    expect(result.totalPoints).toEqual(800); // 500 + 300
  });
});
