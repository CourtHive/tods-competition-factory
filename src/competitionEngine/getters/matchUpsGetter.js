import { getSchedulingProfile } from '../governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { scheduledSortedMatchUps } from '../../global/sorting/scheduledSortedMatchUps';
import { getVenuesAndCourts } from './venuesAndCourtsGetter';
import {
  getEventTimeItem,
  getTournamentTimeItem,
} from '../../tournamentEngine/governors/queryGovernor/timeItems';
import {
  allTournamentMatchUps,
  tournamentMatchUps,
} from '../../tournamentEngine/getters/matchUpsGetter';

import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';
import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { COMPLETED } from '../../constants/matchUpStatusConstants';

export function allCompetitionMatchUps({
  scheduleVisibilityFilters,
  afterRecoveryTimes,
  tournamentRecords,
  matchUpFilters,
  contextFilters,
  nextMatchUps,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  const competitionMatchUps = tournamentIds
    .map((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const { matchUps } = allTournamentMatchUps({
        scheduleVisibilityFilters,
        afterRecoveryTimes,
        tournamentRecord,
        matchUpFilters,
        contextFilters,
        nextMatchUps,
      });
      return matchUps;
    })
    .flat();

  return { matchUps: competitionMatchUps };
}

export function competitionScheduleMatchUps(params) {
  if (
    typeof params?.tournamentRecords !== 'object' ||
    !Object.keys(params?.tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };
  const { courts, venues } = getVenuesAndCourts(params);
  const schedulingProfile = getSchedulingProfile(params).schedulingProfile;

  const { matchUpFilters = {}, contextFilters = {} } = params;
  const {
    sortDateMatchUps = true,
    alwaysReturnCompleted,
    tournamentRecords,
    activeTournamentId,
    usePublishState,
    status = PUBLIC,
    sortCourtsData,
  } = params;

  const timeItem =
    usePublishState &&
    getTournamentTimeItem({
      tournamentRecord: tournamentRecords[activeTournamentId],
      itemType: `${PUBLISH}.${STATUS}`,
    }).timeItem;
  const publishStatus = timeItem?.itemValue?.[status];

  const allCompletedMatchUps = alwaysReturnCompleted
    ? competitionMatchUps({
        ...params,
        matchUpFilters: { ...matchUpFilters, matchUpStatuses: [COMPLETED] },
        contextFilters,
      }).completedMatchUps
    : [];

  if (
    usePublishState &&
    (!publishStatus || !Object.keys(publishStatus).length)
  ) {
    return {
      completedMatchUps: allCompletedMatchUps,
      dateMatchUps: [],
      courtsData: [],
      venues,
    };
  }

  const publishedDrawIds =
    usePublishState &&
    getCompetitionPublishedDrawIds({ tournamentRecords }).drawIds;

  if (publishedDrawIds?.length) {
    if (!contextFilters.drawIds) {
      contextFilters.drawIds = publishedDrawIds;
    } else {
      contextFilters.drawIds = contextFilters.drawIds.filter((drawId) =>
        publishedDrawIds.includes(drawId)
      );
    }
  }

  if (publishStatus?.eventIds?.length) {
    if (matchUpFilters.eventIds) {
      if (!matchUpFilters.eventIds.length) {
        matchUpFilters.eventIds = publishStatus.eventIds;
      } else {
        matchUpFilters.eventIds = matchUpFilters.eventIds.filter((eventId) =>
          publishStatus.eventIds.includes(eventId)
        );
      }
    } else {
      matchUpFilters.eventIds = publishStatus.eventIds;
    }
  }

  if (publishStatus?.scheduledDates?.length) {
    if (matchUpFilters.scheduledDates) {
      if (!matchUpFilters.scheduledDates.length) {
        matchUpFilters.scheduledDates = publishStatus.scheduledDates;
      } else {
        matchUpFilters.scheduledDates = matchUpFilters.scheduledDates.filter(
          (scheduledDate) =>
            publishStatus.scheduledDates.includes(scheduledDate)
        );
      }
    } else {
      matchUpFilters.scheduledDates = publishStatus.scheduledDates;
    }
  }

  // optimization: if all completed matchUps have already been retrieved, skip the hydration process
  if (alwaysReturnCompleted) {
    if (matchUpFilters.excludeMatchUpStatuses?.length) {
      if (!matchUpFilters.excludeMatchUpStatuses.includes(COMPLETED)) {
        matchUpFilters.excludeMatchUpStatuses.push(COMPLETED);
      }
    } else {
      matchUpFilters.excludeMatchUpStatuses = [COMPLETED];
    }
  }

  const { completedMatchUps, upcomingMatchUps, pendingMatchUps } =
    competitionMatchUps({ ...params, matchUpFilters, contextFilters });

  const relevantMatchUps = [
    ...(upcomingMatchUps || []),
    ...(pendingMatchUps || []),
  ];

  const dateMatchUps = sortDateMatchUps
    ? scheduledSortedMatchUps({ matchUps: relevantMatchUps, schedulingProfile })
    : relevantMatchUps;

  const courtsData = courts.map((court) => {
    const matchUps = getCourtMatchUps(court);
    return {
      ...court,
      matchUps,
      surfaceCategory: court?.surfaceCategory || '',
    };
  });

  return {
    courtsData,
    completedMatchUps: alwaysReturnCompleted
      ? allCompletedMatchUps
      : completedMatchUps,
    dateMatchUps,
    venues,
  };

  function getCourtMatchUps({ courtId }) {
    const courtMatchUps = dateMatchUps.filter(
      (matchUp) => matchUp.schedule?.courtId === courtId
    );
    return sortCourtsData
      ? scheduledSortedMatchUps({
          matchUps: courtMatchUps,
          schedulingProfile,
        })
      : courtMatchUps;
  }
}

// this was used to float matchUps with checked in participants to the top of the sorted matchUps
export function getFloatValue(matchUp) {
  const allParticipantsCheckedIn = matchUp?.allParticipantsCheckedIn && 100;
  const checkedInParticipantsCount =
    (matchUp?.checkedInParticipantIds?.length || 0) * 10;

  // floatValue ensures that allParticipantsCheckedIn always floats to top as millisecond
  // differences are not always enough to differentiate
  const floatValue = checkedInParticipantsCount + allParticipantsCheckedIn;
  return floatValue;
}

export function competitionMatchUps({
  scheduleVisibilityFilters,
  participantsProfile,
  policyDefinitions,
  tournamentRecords,
  matchUpFilters,
  contextFilters,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  const tournamentsMatchUps = tournamentIds.map((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    return tournamentMatchUps({
      scheduleVisibilityFilters,
      participantsProfile,
      policyDefinitions,
      tournamentRecord,
      matchUpFilters,
      contextFilters,
    });
  });

  const matchUpGroupings = tournamentsMatchUps.reduce(
    (groupings, matchUpGroupings) => {
      const keys = Object.keys(matchUpGroupings);
      keys.forEach((key) => {
        if (!groupings[key]) groupings[key] = [];
        groupings[key] = groupings[key].concat(matchUpGroupings[key]);
      });

      return groupings;
    },
    {}
  );

  return matchUpGroupings;
}

function getCompetitionPublishedDrawIds({ tournamentRecords }) {
  const drawIds = [];

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    for (const event of tournamentRecord.events || []) {
      const { timeItem } = getEventTimeItem({
        itemType: `${PUBLISH}.${STATUS}`,
        event,
      });

      const pubState = timeItem?.itemValue?.[PUBLIC];
      if (pubState?.drawIds?.length) {
        drawIds.push(...pubState.drawIds);
      } else {
        // if there are no drawIds specified then all draws are published
        const eventDrawIds = (event.drawDefinitions || [])
          .map(({ drawId }) => drawId)
          .filter(Boolean);
        drawIds.push(...eventDrawIds);
      }
    }
  }

  return { drawIds };
}
