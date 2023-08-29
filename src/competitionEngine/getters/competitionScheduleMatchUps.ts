import { getSchedulingProfile } from '../governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { scheduledSortedMatchUps } from '../../global/sorting/scheduledSortedMatchUps';
import { getVenuesAndCourts } from './venuesAndCourtsGetter';
import { courtGridRows } from '../generators/courtGridRows';
import { competitionMatchUps } from './matchUpsGetter';
import {
  getEventTimeItem,
  getTournamentTimeItem,
} from '../../tournamentEngine/governors/queryGovernor/timeItems';

import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';
import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { COMPLETED } from '../../constants/matchUpStatusConstants';
import { TournamentRecordsArgs } from '../../types/factoryTypes';
import { Venue } from '../../types/tournamentFromSchema';
import { HydratedMatchUp } from '../../types/hydrated';

export function competitionScheduleMatchUps(params): {
  completedMatchUps?: HydratedMatchUp[];
  dateMatchUps?: HydratedMatchUp[];
  courtPrefix?: string;
  error?: ErrorType;
  venues?: Venue[];
  courtsData?: any;
  rows?: any[];
} {
  if (
    typeof params?.tournamentRecords !== 'object' ||
    !Object.keys(params?.tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };
  const { courts, venues } = getVenuesAndCourts(params);
  const getResult: any = getSchedulingProfile(params);
  const schedulingProfile = getResult.schedulingProfile;

  const { matchUpFilters = {}, contextFilters = {} } = params;
  const {
    sortDateMatchUps = true,
    courtCompletedMatchUps,
    alwaysReturnCompleted,
    activeTournamentId,
    tournamentRecords,
    withCourtGridRows,
    minCourtGridRows,
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

  const courtsData = courts?.map((court) => {
    const matchUps = getCourtMatchUps(court);
    return {
      surfaceCategory: court?.surfaceCategory || '',
      matchUps,
      ...court,
    };
  });

  const result: any = {
    courtsData,
    completedMatchUps: alwaysReturnCompleted
      ? allCompletedMatchUps
      : completedMatchUps, // completed matchUps for the filter date
    dateMatchUps, // all incomplete matchUps for the filter date
    venues,
  };

  if (withCourtGridRows) {
    const { rows, courtPrefix } = courtGridRows({
      minRowsCount: minCourtGridRows,
      courtsData,
    });
    result.courtPrefix = courtPrefix; // pass through for access to internal defaults by consumer
    result.rows = rows;
  }

  return result;

  function getCourtMatchUps({ courtId }) {
    const matchUpsToConsider = courtCompletedMatchUps
      ? dateMatchUps.concat(completedMatchUps || [])
      : dateMatchUps;
    const courtMatchUps = matchUpsToConsider.filter(
      (matchUp) =>
        matchUp.schedule?.courtId === courtId ||
        matchUp.schedule?.allocatedCourts
          ?.map(({ courtId }) => courtId)
          .includes(courtId)
    );

    return sortCourtsData
      ? scheduledSortedMatchUps({
          matchUps: courtMatchUps,
          schedulingProfile,
        })
      : courtMatchUps;
  }
}

function getCompetitionPublishedDrawIds({
  tournamentRecords,
}: TournamentRecordsArgs) {
  const drawIds: string[] = [];

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
