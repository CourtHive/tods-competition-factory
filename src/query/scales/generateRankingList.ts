type PointAward = Record<string, any>;

type CountingBucket = {
  bucketName: string;
  eventTypes?: string[];
  pointComponents: string[];
  bestOfCount: number;
  maxResultsPerLevel?: Record<number, number>;
};

type AggregationRules = {
  rollingPeriodDays?: number;
  separateByGender?: boolean;
  perCategory?: boolean;
  countingBuckets?: CountingBucket[];
  tiebreakCriteria?: string[];
  minCountableResults?: number;
  maxResultsPerLevel?: Record<number, number>;
  bestOfCount?: number;
};

type CategoryFilter = {
  ageCategoryCodes?: string[];
  genders?: string[];
  eventTypes?: string[];
};

export type RankingListEntry = {
  personId: string;
  totalPoints: number;
  rank: number;
  meetsMinimum: boolean;
  countingResults: PointAward[];
  droppedResults: PointAward[];
  bucketBreakdown?: {
    bucketName: string;
    countingResults: PointAward[];
    droppedResults: PointAward[];
    bucketTotal: number;
  }[];
};

type GenerateRankingListArgs = {
  pointAwards: PointAward[];
  aggregationRules?: AggregationRules;
  categoryFilter?: CategoryFilter;
  asOfDate?: string;
};

export function generateRankingList({
  pointAwards,
  aggregationRules = {},
  categoryFilter,
  asOfDate,
}: GenerateRankingListArgs): RankingListEntry[] {
  const {
    rollingPeriodDays,
    countingBuckets,
    tiebreakCriteria = [],
    minCountableResults = 0,
    maxResultsPerLevel,
    bestOfCount,
  } = aggregationRules;

  // Step 1: Filter by category/gender/eventType
  let filtered = pointAwards;
  if (categoryFilter) {
    filtered = filtered.filter((award) => {
      if (categoryFilter.ageCategoryCodes?.length) {
        const code = award.category?.ageCategoryCode;
        if (!code || !categoryFilter.ageCategoryCodes.includes(code)) return false;
      }
      if (categoryFilter.genders?.length) {
        const gender = award.category?.gender || award.gender;
        if (!gender || !categoryFilter.genders.includes(gender)) return false;
      }
      if (categoryFilter.eventTypes?.length) {
        if (!award.eventType || !categoryFilter.eventTypes.includes(award.eventType)) return false;
      }
      return true;
    });
  }

  // Step 2: Filter by rolling period
  if (rollingPeriodDays && asOfDate) {
    const cutoff = new Date(asOfDate);
    cutoff.setDate(cutoff.getDate() - rollingPeriodDays);
    const cutoffTime = cutoff.getTime();

    filtered = filtered.filter((award) => {
      if (!award.endDate) return true; // no date → include
      return new Date(award.endDate).getTime() >= cutoffTime;
    });
  }

  // Step 3: Group by personId
  const byPerson: Record<string, PointAward[]> = {};
  for (const award of filtered) {
    const key = award.personId;
    if (!key) continue;
    if (!byPerson[key]) byPerson[key] = [];
    byPerson[key].push(award);
  }

  // Step 4: Compute points per participant
  const entries: RankingListEntry[] = [];

  for (const [personId, awards] of Object.entries(byPerson)) {
    let totalPoints = 0;
    let allCountingResults: PointAward[] = [];
    let allDroppedResults: PointAward[] = [];
    let bucketBreakdown;

    if (countingBuckets?.length) {
      // Bucket-based aggregation
      bucketBreakdown = [];

      for (const bucket of countingBuckets) {
        const { bucketName, eventTypes, pointComponents, bestOfCount: bucketBestOf, maxResultsPerLevel: bucketMaxPerLevel } = bucket;

        // Filter awards into this bucket
        let bucketAwards = awards;
        if (eventTypes?.length) {
          bucketAwards = bucketAwards.filter((a) => a.eventType && eventTypes.includes(a.eventType));
        }

        // Extract relevant point value for each award based on pointComponents
        const scoredAwards = bucketAwards.map((a) => {
          let value = 0;
          for (const component of pointComponents) {
            value += typeof a[component] === 'number' ? a[component] : 0;
          }
          return { award: a, value };
        });

        // Sort by value descending
        scoredAwards.sort((a, b) => b.value - a.value);

        // Apply maxResultsPerLevel
        let capped = scoredAwards;
        let levelDropped: typeof scoredAwards = [];
        if (bucketMaxPerLevel) {
          const levelCounts: Record<number, number> = {};
          capped = [];
          for (const sa of scoredAwards) {
            const lvl = sa.award.level;
            if (lvl === undefined || !bucketMaxPerLevel[lvl]) {
              capped.push(sa);
            } else {
              levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
              if (levelCounts[lvl] <= bucketMaxPerLevel[lvl]) {
                capped.push(sa);
              } else {
                levelDropped.push(sa);
              }
            }
          }
        }

        // Apply bestOfCount
        const counting = bucketBestOf > 0 ? capped.slice(0, bucketBestOf) : capped;
        const dropped = [
          ...(bucketBestOf > 0 ? capped.slice(bucketBestOf) : []),
          ...levelDropped,
        ];

        const bucketTotal = counting.reduce((sum, sa) => sum + sa.value, 0);
        totalPoints += bucketTotal;

        allCountingResults.push(...counting.map((sa) => sa.award));
        allDroppedResults.push(...dropped.map((sa) => sa.award));

        bucketBreakdown.push({
          bucketName,
          countingResults: counting.map((sa) => sa.award),
          droppedResults: dropped.map((sa) => sa.award),
          bucketTotal,
        });
      }
    } else {
      // No buckets — use global bestOfCount/maxResultsPerLevel
      const scoredAwards = awards.map((a) => ({
        award: a,
        value: (a.points || 0) + (a.qualityWinPoints || 0),
      }));

      scoredAwards.sort((a, b) => b.value - a.value);

      // Apply maxResultsPerLevel
      let capped = scoredAwards;
      let levelDropped: typeof scoredAwards = [];
      if (maxResultsPerLevel) {
        const levelCounts: Record<number, number> = {};
        capped = [];
        for (const sa of scoredAwards) {
          const lvl = sa.award.level;
          if (lvl === undefined || !maxResultsPerLevel[lvl]) {
            capped.push(sa);
          } else {
            levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
            if (levelCounts[lvl] <= maxResultsPerLevel[lvl]) {
              capped.push(sa);
            } else {
              levelDropped.push(sa);
            }
          }
        }
      }

      const counting = bestOfCount && bestOfCount > 0 ? capped.slice(0, bestOfCount) : capped;
      const dropped = [
        ...(bestOfCount && bestOfCount > 0 ? capped.slice(bestOfCount) : []),
        ...levelDropped,
      ];

      totalPoints = counting.reduce((sum, sa) => sum + sa.value, 0);
      allCountingResults = counting.map((sa) => sa.award);
      allDroppedResults = dropped.map((sa) => sa.award);
    }

    const meetsMinimum = allCountingResults.length >= minCountableResults;

    const entry: RankingListEntry = {
      personId,
      totalPoints,
      rank: 0, // assigned below
      meetsMinimum,
      countingResults: allCountingResults,
      droppedResults: allDroppedResults,
    };

    if (bucketBreakdown) entry.bucketBreakdown = bucketBreakdown;

    entries.push(entry);
  }

  // Step 5: Sort by totalPoints descending
  entries.sort((a, b) => b.totalPoints - a.totalPoints);

  // Step 6: Apply tiebreakers for entries with same totalPoints
  if (tiebreakCriteria.length) {
    entries.sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;

      for (const criterion of tiebreakCriteria) {
        const result = applyTiebreaker(criterion, a, b);
        if (result !== 0) return result;
      }
      return 0;
    });
  }

  // Step 7: Assign ranks (1-based, tied ranks for equal positions)
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].totalPoints === entries[i - 1].totalPoints) {
      // Check if tiebreaker resolved them differently
      const tieResolved =
        tiebreakCriteria.length > 0 &&
        tiebreakCriteria.some((c) => applyTiebreaker(c, entries[i - 1], entries[i]) !== 0);

      if (!tieResolved) {
        entries[i].rank = entries[i - 1].rank;
      } else {
        entries[i].rank = currentRank;
      }
    } else {
      entries[i].rank = currentRank;
    }
    currentRank = i + 2; // next potential rank
  }

  return entries;
}

function applyTiebreaker(criterion: string, a: RankingListEntry, b: RankingListEntry): number {
  switch (criterion) {
    case 'highestSingleResult': {
      const aMax = Math.max(0, ...a.countingResults.map((r) => r.points || 0));
      const bMax = Math.max(0, ...b.countingResults.map((r) => r.points || 0));
      return bMax - aMax;
    }
    case 'mostCountingResults': {
      return b.countingResults.length - a.countingResults.length;
    }
    case 'mostWins': {
      const aWins = a.countingResults.reduce((sum, r) => sum + (r.winCount || 0), 0);
      const bWins = b.countingResults.reduce((sum, r) => sum + (r.winCount || 0), 0);
      return bWins - aWins;
    }
    default:
      return 0;
  }
}
