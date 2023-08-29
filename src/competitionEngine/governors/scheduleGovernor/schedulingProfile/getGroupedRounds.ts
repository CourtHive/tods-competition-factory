// groups schedule profile rounds where adjacent hashes are equivalent
// if { garmanSinglePass: true } then group all rounds into a single group
// if { garmanSinglePass: true } then the one group has greatestAverageMinutes
export function getGroupedRounds({
  scheduledRoundsDetails,
  greatestAverageMinutes,
  garmanSinglePass,
}) {
  const groupedRounds: any[] = [];
  let groupedMatchUpIds = [];
  let roundPeriodLength;
  let recoveryMinutes;
  let averageMinutes;
  let lastHash;

  for (const roundDetails of scheduledRoundsDetails.filter(Boolean)) {
    if (!lastHash) lastHash = roundDetails.hash;
    if (roundDetails.hash === lastHash || garmanSinglePass) {
      groupedMatchUpIds = groupedMatchUpIds.concat(roundDetails.matchUpIds);
    }
    if (roundDetails.hash !== lastHash && !garmanSinglePass) {
      lastHash = roundDetails.hash;
      groupedRounds.push({
        averageMinutes,
        recoveryMinutes,
        roundPeriodLength,
        matchUpIds: groupedMatchUpIds,
      });
      groupedMatchUpIds = roundDetails.matchUpIds;
    }
    averageMinutes = garmanSinglePass
      ? greatestAverageMinutes
      : roundDetails.averageMinutes;
    recoveryMinutes = roundDetails.recoveryMinutes;
    roundPeriodLength = roundDetails.roundPeriodLength;
  }

  if (groupedMatchUpIds.length) {
    groupedRounds.push({
      averageMinutes,
      recoveryMinutes,
      roundPeriodLength,
      matchUpIds: groupedMatchUpIds,
    });
  }

  return { groupedRounds };
}
