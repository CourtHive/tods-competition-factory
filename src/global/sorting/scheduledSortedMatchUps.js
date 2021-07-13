import { extractDate, extractTime } from '../../utilities/dateTime';

export function scheduledSortedMatchUps({ matchUps = [], schedulingProfile }) {
  const profileHash = {};

  // hash is used to store a sort order value for scheduled rounds
  const getHash = ({ eventId, drawId, structureId, roundNumber }) => {
    return `${eventId}|${drawId}|${structureId}${roundNumber}`;
  };

  if (schedulingProfile?.length) {
    const roundsGroupings = schedulingProfile
      .map(({ venues }) => venues.map(({ rounds }) => rounds))
      .flat();

    roundsGroupings.forEach((grouping) => {
      const sortedRounds = grouping.sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      sortedRounds.forEach(
        ({ eventId, drawId, structureId, roundNumber }, index) => {
          const hash = getHash({ eventId, drawId, structureId, roundNumber });
          profileHash[hash] = index;
        }
      );
    });
  }

  const sortedMatchUps = [];
  const dateGroups = { noScheduledDate: [] };

  // 1. Segregate matchUps by date (date can come from schedule.scheduledDate or schedule.scheduledTime)
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

  // 2. For each date group, sort all matchUps by time
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

    // 3. for each time group, sort all matchUps by hash values derived from rounds group order
    for (const scheduledTime of sortedTimeKeys) {
      const timeGroup = timeGroups[scheduledTime];

      timeGroup.sort((a, b) => {
        const sortValueA = profileHash[getHash(a)] || 0;
        const sortValueB = profileHash[getHash(b)] || 0;
        return sortValueA - sortValueB;
      });

      sortedMatchUps.push(...timeGroup);
    }
  }

  return sortedMatchUps;
}
