import { getSchedulingProfile } from '../governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { scheduledSortedMatchUps } from '../../global/sorting/scheduledSortedMatchUps';

import { getVenuesAndCourts } from './venuesAndCourtsGetter';
import {
  allTournamentMatchUps,
  tournamentMatchUps,
} from '../../tournamentEngine/getters/matchUpsGetter';

import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';
import { getTournamentTimeItem } from '../../tournamentEngine/governors/queryGovernor/timeItems';
import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';

export function allCompetitionMatchUps({
  scheduleVisibilityFilters,
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

  let { matchUpFilters } = params;
  const {
    sortDateMatchUps = true,
    usePublishState,
    status = PUBLIC,
    sortCourtsData,
  } = params;

  const timeItem =
    usePublishState &&
    getTournamentTimeItem({ itemType: `${PUBLISH}.${STATUS}` }).timeItem;

  const publishStatus = timeItem?.itemValue?.[status];
  if (publishStatus?.eventIds?.length) {
    if (matchUpFilters?.eventIds) {
      if (!matchUpFilters.eventIds.length) {
        matchUpFilters.eventIds = publishStatus.eventIds;
      } else {
        matchUpFilters.eventIds = matchUpFilters.eventIds.filter((eventId) =>
          publishStatus.eventIds.includes(eventId)
        );
      }
    } else {
      matchUpFilters = { eventIds: publishStatus.eventIds };
    }
  }

  if (publishStatus?.scheduleDates?.length) {
    if (matchUpFilters?.scheduleDates) {
      if (!matchUpFilters.scheduleDates.length) {
        matchUpFilters.scheduleDates = publishStatus.scheduleDates;
      } else {
        matchUpFilters.scheduleDates = matchUpFilters.scheduleDates.filter(
          (scheduleDate) => publishStatus.scheduleDates.includes(scheduleDate)
        );
      }
    } else {
      matchUpFilters = { scheduleDates: publishStatus.scheduleDates };
    }
  }

  const { completedMatchUps, upcomingMatchUps, pendingMatchUps } =
    competitionMatchUps({ ...params, matchUpFilters });

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

  return { courtsData, completedMatchUps, dateMatchUps, venues };

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

  /*
  // this was used to float matchUps with checked in participants to the top of the sorted matchUps
  function getFloatValue(matchUp) {
    const allParticipantsCheckedIn = matchUp?.allParticipantsCheckedIn && 100;
    const checkedInParticipantsCount =
      (matchUp?.checkedInParticipantIds?.length || 0) * 10;

    // floatValue ensures that allParticipantsCheckedIn always floats to top as millisecond
    // differences are not always enough to differentiate
    const floatValue = checkedInParticipantsCount + allParticipantsCheckedIn;
    return floatValue;
  }
  */
}

export function competitionMatchUps({
  scheduleVisibilityFilters,
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
