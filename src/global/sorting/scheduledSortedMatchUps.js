import {
  extractDate,
  extractTime /*, timeToDate */,
} from '../../utilities/dateTime';

export function scheduledSortedMatchUps({ matchUps = [], schedulingProfile }) {
  const profileHash = {};
  const sortedMatchUps = [];

  if (schedulingProfile?.length) {
    /*
    // 1. Segregate matchUps by date (date can come from schedule.scheduledDate or schedule.scheduledTime)
    // 2. For each date group, sort all matchUps by time
    // 3. for each time group, sort all matchUps by `${eventId}|${drawId}|${structureId}`
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

  const dateGroups = { noScheduledDate: [] };

  for (const matchUp of matchUps) {
    const schedule = matchUp.schedule || {};
    const scheduledDate =
      (schedule.scheduledDate && extractDate(schedule.scheduledDate)) ||
      (schedule.scheduledTime && extractDate(schedule.scheduledTime)) ||
      'noScheduledDate';

    if (!dateGroups[scheduledDate]) dateGroups[scheduledDate] = [];
    dateGroups[scheduledDate].push(matchUp);
  }

  // this works because all dates are strings and 'noScheduledDate' sorts to last after numeric strings
  const sortedDateKeys = Object.keys(dateGroups).sort();

  for (const scheduledDate of sortedDateKeys) {
    const dateGroup = dateGroups[scheduledDate];

    const timeGroups = { noScheduledTime: [] };

    for (const matchUp of dateGroup) {
      const schedule = matchUp.schedule || {};
      const scheduledTime =
        (schedule.scheduledTime && extractTime(schedule.scheduledTime)) ||
        'noScheduledTime';

      if (!timeGroups[scheduledTime]) timeGroups[scheduledTime] = [];
      timeGroups[scheduledTime].push(matchUp);
    }

    // this works because all times are strings '00:00' and 'noScheduledTime' sorts to last after numeric strings
    const sortedTimeKeys = Object.keys(timeGroups).sort();

    for (const scheduledTime of sortedTimeKeys) {
      const timeGroup = timeGroups[scheduledTime];

      timeGroup.sort((a, b) => {
        const sortValueA = profileHash[matchUpHash(a)] || 0;
        const sortValueB = profileHash[matchUpHash(b)] || 0;
        return sortValueA - sortValueB;
      });

      sortedMatchUps.push(...timeGroup);
    }
  }

  return sortedMatchUps;
  /*
  return matchUps.sort((a, b) => {
    return (
      getComparisionTime(a?.scheduledTime) -
      getComparisionTime(b?.scheduledTime)
    );
  });
  */
}

function matchUpHash(matchUp) {
  const { eventId, drawId, structureId, roundNumber } = matchUp;
  return `${eventId}|${drawId}|${structureId}${roundNumber}`;
}

/*
function getComparisionTime(scheduledTime) {
  return timeToDate(extractTime(scheduledTime)).getTime();
}
*/

/*
    dateGroup.sort((a, b) => {
      const splitA = extractTime(a?.schedule?.scheduledTime || '').split(':');
      const splitB = extractTime(b?.schedule?.scheduledTime || '').split(':');
      parseInt(splitA[0]) - parseInt(splitB[0]) === 0
        ? parseInt(splitA[1]) - parseInt(splitB[1])
        : parseInt(splitA[0]) - parseInt(splitB[0]);
    });
    */
