type PointAward = Record<string, any>;

type CountingBucket = {
  bucketName: string;
  eventTypes?: string[];
  pointComponents: string[];
  bestOfCount: number;
  maxResultsPerLevel?: Record<number, number>;
};

type AggregationRules = {
  countingBuckets?: CountingBucket[];
  maxResultsPerLevel?: Record<number, number>;
  bestOfCount?: number;
};

type BucketBreakdown = {
  bucketName: string;
  countingResults: PointAward[];
  droppedResults: PointAward[];
  bucketTotal: number;
};

type GetParticipantPointsArgs = {
  pointAwards: PointAward[];
  personId: string;
  aggregationRules?: AggregationRules;
};

export function getParticipantPoints({
  pointAwards,
  personId,
  aggregationRules = {},
}: GetParticipantPointsArgs): {
  buckets: BucketBreakdown[];
  totalPoints: number;
} {
  const { countingBuckets, maxResultsPerLevel, bestOfCount } = aggregationRules;

  // Filter to this participant's awards
  const awards = pointAwards.filter((a) => a.personId === personId);

  if (countingBuckets?.length) {
    const buckets: BucketBreakdown[] = [];
    let totalPoints = 0;

    for (const bucket of countingBuckets) {
      const { bucketName, eventTypes, pointComponents, bestOfCount: bucketBestOf, maxResultsPerLevel: bucketMaxPerLevel } = bucket;

      let bucketAwards = awards;
      if (eventTypes?.length) {
        bucketAwards = bucketAwards.filter((a) => a.eventType && eventTypes.includes(a.eventType));
      }

      const scoredAwards = bucketAwards.map((a) => {
        let value = 0;
        for (const component of pointComponents) {
          value += typeof a[component] === 'number' ? a[component] : 0;
        }
        return { award: a, value };
      });

      scoredAwards.sort((a, b) => b.value - a.value);

      let capped = scoredAwards;
      if (bucketMaxPerLevel) {
        const levelCounts: Record<number, number> = {};
        capped = scoredAwards.filter((sa) => {
          const lvl = sa.award.level;
          if (lvl === undefined || !bucketMaxPerLevel[lvl]) return true;
          levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
          return levelCounts[lvl] <= bucketMaxPerLevel[lvl];
        });
      }

      const counting = bucketBestOf > 0 ? capped.slice(0, bucketBestOf) : capped;
      const dropped = bucketBestOf > 0 ? capped.slice(bucketBestOf) : [];

      const bucketTotal = counting.reduce((sum, sa) => sum + sa.value, 0);
      totalPoints += bucketTotal;

      buckets.push({
        bucketName,
        countingResults: counting.map((sa) => sa.award),
        droppedResults: dropped.map((sa) => sa.award),
        bucketTotal,
      });
    }

    return { buckets, totalPoints };
  }

  // No buckets — single "All" bucket
  const scoredAwards = awards.map((a) => ({
    award: a,
    value: (a.points || 0) + (a.qualityWinPoints || 0),
  }));

  scoredAwards.sort((a, b) => b.value - a.value);

  let capped = scoredAwards;
  if (maxResultsPerLevel) {
    const levelCounts: Record<number, number> = {};
    capped = scoredAwards.filter((sa) => {
      const lvl = sa.award.level;
      if (lvl === undefined || !maxResultsPerLevel[lvl]) return true;
      levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
      return levelCounts[lvl] <= maxResultsPerLevel[lvl];
    });
  }

  const counting = bestOfCount && bestOfCount > 0 ? capped.slice(0, bestOfCount) : capped;
  const dropped = bestOfCount && bestOfCount > 0 ? capped.slice(bestOfCount) : [];

  const totalPoints = counting.reduce((sum, sa) => sum + sa.value, 0);

  return {
    buckets: [
      {
        bucketName: 'All',
        countingResults: counting.map((sa) => sa.award),
        droppedResults: dropped.map((sa) => sa.award),
        bucketTotal: totalPoints,
      },
    ],
    totalPoints,
  };
}
