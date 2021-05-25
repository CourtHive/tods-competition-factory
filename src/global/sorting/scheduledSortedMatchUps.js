import { extractTime, timeToDate } from '../../utilities/dateTime';

export function scheduledSortedMatchUps({ matchUps, schedulingProfile }) {
  if (schedulingProfile?.length) {
    /*
    const dateSchedulingProfiles = schedulingProfile.sort((a, b) => {
      new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
    });
    dateSchedulingProfiles.forEach((dateProfile) => {
      const sortedRounds = rounds.sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
    })
    */
  }
  return matchUps.sort((a, b) => {
    return (
      getComparisionTime(a?.scheduledTime) -
      getComparisionTime(b?.scheduledTime)
    );
  });
}

function getComparisionTime(scheduledTime) {
  return timeToDate(extractTime(scheduledTime)).getTime();
}
