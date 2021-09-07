export function getGroupedRounds({
  scheduledRoundsDetails,
  greatestAverageMinutes,
  garmanSinglePass,
}) {
  let lastHash;
  let groupedMatchUpIds = [];
  let averageMinutes;
  let recoveryMinutes;
  let roundPeriodLength;
  let groupedRounds = [];
  for (const roundDetails of scheduledRoundsDetails) {
    if (!lastHash || roundDetails.hash === lastHash || garmanSinglePass) {
      groupedMatchUpIds = groupedMatchUpIds.concat(roundDetails.matchUpIds);
    }

    if (lastHash && roundDetails.hash !== lastHash && !garmanSinglePass) {
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
