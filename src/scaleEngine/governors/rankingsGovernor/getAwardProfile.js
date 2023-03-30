export function getAwardProfile({
  participation = {},
  awardProfiles,
  eventType,
  drawSize,
  drawType,
  category,
  level,
}) {
  const { participationOrder, flightNumber, rankingStage } = participation;

  const awardProfile = awardProfiles.find(
    (profile) =>
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
