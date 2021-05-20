export function findMatchupFormatAverageTimes({
  matchUpAverageTimes,
  matchUpFormat,
} = {}) {
  // first find all matchUpAverageTime definitions which include matchUpFormats...
  // ... that either exactly match or start with the target matchUpFormat.
  const codeMatches =
    matchUpAverageTimes
      ?.map(({ matchUpFormatCodes }) => {
        const matching = matchUpFormatCodes?.filter((code) =>
          code?.startsWith(matchUpFormat)
        );
        return matching;
      })
      .flat()
      .filter((f) => f)
      // sort by length; shortest first; prioritize first match
      .sort((a, b) => (a?.length || 0) - (b?.length || 0)) || [];

  // determine if there is an exact match
  const exactCodeMatch = codeMatches.includes(matchUpFormat);
  // select the exact match or the shortest code which matches
  const targetCode = exactCodeMatch ? matchUpFormat : codeMatches[0];
  const targetDefinition = matchUpAverageTimes?.find(
    ({ matchUpFormatCodes, averageTimes }) =>
      matchUpFormatCodes?.find((code) => targetCode === code) && averageTimes
  );
  return targetDefinition?.averageTimes;
}

export function findMatchupFormatRecoveryTimes({
  matchUpRecoveryTimes,
  averageMinutes,
  matchUpFormat,
} = {}) {
  return matchUpRecoveryTimes?.find(
    ({ matchUpFormatCodes, averageTimes, recoveryTimes }) => {
      if (averageTimes && averageMinutes) {
        const { greaterThan = 0, lessThan = 360 } = averageTimes;
        if (averageMinutes > greaterThan && averageMinutes < lessThan)
          return true;
      }
      const codeMatch =
        matchUpFormatCodes?.find((code) => code?.startsWith(matchUpFormat)) &&
        recoveryTimes;
      return codeMatch;
    }
  )?.recoveryTimes;
}
