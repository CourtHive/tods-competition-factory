import { extractDate } from '../../../tools/dateTime';

export function getUpdatedSchedulingProfile({ schedulingProfile, venueIds, eventIds, drawIds }) {
  const issues: string[] = [];
  const updatedSchedulingProfile = schedulingProfile
    ?.map((dateSchedulingProfile) => {
      const date = extractDate(dateSchedulingProfile?.scheduleDate);
      if (!date) {
        issues.push(`Invalid date: ${dateSchedulingProfile?.scheduledDate}`);
        return;
      }

      const venues = (dateSchedulingProfile?.venues || [])
        .map((venue) => {
          const { rounds, venueId } = venue;
          const venueExists = venueIds?.includes(venueId);
          if (!venueExists) {
            issues.push(`Missing venueId: ${venueId}`);
            return;
          }

          const filteredRounds = rounds.filter((round) => {
            const validEventIdAndDrawId = eventIds.includes(round.eventId) && drawIds.includes(round.drawId);
            if (!validEventIdAndDrawId) issues.push(`Invalid eventId: ${round.eventId} or drawId: ${round.drawId}`);
            return validEventIdAndDrawId;
          });

          if (!filteredRounds.length) return;

          return { venueId, rounds: filteredRounds };
        })
        .filter(Boolean);

      return venues.length && date && { ...dateSchedulingProfile, venues };
    })
    .filter(Boolean);

  const modifications = issues.length;
  return { updatedSchedulingProfile, modifications, issues };
}
