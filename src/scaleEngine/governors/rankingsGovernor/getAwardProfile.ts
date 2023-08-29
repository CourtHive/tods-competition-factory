export function getAwardProfile(params) {
  const {
    participation = {},
    awardProfiles,
    startDate,
    eventType,
    drawSize,
    drawType,
    category,
    endDate,
    level,
  } = params;
  const { participationOrder, flightNumber, rankingStage } = participation;

  const isValidDateRange = (profile) => {
    if ((!startDate && !endDate) || !profile.dateRanges) return true;
    return profile.dateRanges.some((dateRange) => {
      const validStartDate =
        !startDate ||
        !dateRange.startDate ||
        new Date(startDate) > new Date(dateRange.startDate);
      const validEndDate =
        !endDate ||
        !dateRange.endDate ||
        new Date(endDate) <= new Date(dateRange.endDate);
      return validStartDate && validEndDate;
    });
  };

  const awardProfile = awardProfiles.find(
    (profile) =>
      isValidDateRange(profile) &&
      (!profile.maxFlightNumber || flightNumber <= profile.maxFlightNumber) &&
      (!profile.drawTypes?.length || profile.drawTypes?.includes(drawType)) &&
      (!profile.drawSizes?.length || profile.drawSizes.includes(drawSize)) &&
      (!profile.stages?.length || profile.stages.includes(rankingStage)) &&
      (!profile.levels?.length || profile.levels.includes(level)) &&
      (!profile.maxDrawSize || drawSize <= profile.maxDrawSize) &&
      (!profile.drawSize || profile.drawSize === drawSize) &&
      (!profile.maxLevel || level <= profile.maxLevel) &&
      (!flightNumber ||
        !profile.flights?.flightNumbers?.length ||
        profile.flights.flightNumbers.includes(flightNumber)) &&
      (!profile.participationOrder ||
        profile.participationOrder === participationOrder) &&
      (!profile.category?.ageCategoryCodes ||
        profile.category.ageCategoryCodes.includes(
          category?.ageCategoryCode
        )) &&
      (!profile.eventTypes?.length || profile.eventTypes?.includes(eventType))
  );

  return { awardProfile };
}
