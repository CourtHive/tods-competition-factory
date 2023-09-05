import { getSchedulingProfile } from '../governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { scheduledSortedMatchUps } from '../../global/sorting/scheduledSortedMatchUps';
import { getVenuesAndCourts } from './venuesAndCourtsGetter';
import { courtGridRows } from '../generators/courtGridRows';
import { competitionMatchUps } from './matchUpsGetter';
import {
  getEventTimeItem,
  getTournamentTimeItem,
} from '../../tournamentEngine/governors/queryGovernor/timeItems';

import { MatchUpFilters } from '../../drawEngine/getters/getMatchUps/filterMatchUps';
import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { COMPLETED } from '../../constants/matchUpStatusConstants';
import { getTournamentId } from '../../global/state/globalState';
import { MatchUpStatusEnum, Venue } from '../../types/tournamentFromSchema';
import { HydratedMatchUp } from '../../types/hydrated';
import {
  TournamentRecords,
  TournamentRecordsArgs,
} from '../../types/factoryTypes';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';

type CompetitionScheduleMatchUpsArgs = {
  tournamentRecords: TournamentRecords;
  courtCompletedMatchUps?: boolean;
  alwaysReturnCompleted?: boolean;
  contextFilters?: MatchUpFilters;
  matchUpFilters?: MatchUpFilters;
  withCourtGridRows?: boolean;
  activeTournamentId?: string;
  sortDateMatchUps?: boolean;
  minCourtGridRows?: number;
  usePublishState?: boolean;
  sortCourtsData?: boolean;
  status?: string;
};

export function competitionScheduleMatchUps(
  params: CompetitionScheduleMatchUpsArgs
): {
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

  const timeItem = usePublishState
    ? getTournamentTimeItem({
        tournamentRecord:
          tournamentRecords[activeTournamentId ?? getTournamentId()],
        itemType: `${PUBLISH}.${STATUS}`,
      }).timeItem
    : undefined;
  const publishStatus = timeItem?.itemValue?.[status];

  const allCompletedMatchUps = alwaysReturnCompleted
    ? competitionMatchUps({
        ...params,
        matchUpFilters: {
          ...params.matchUpFilters,
          matchUpStatuses: [MatchUpStatusEnum.Completed],
        },
        contextFilters: params.contextFilters,
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

  const publishedDrawIds = usePublishState
    ? getCompetitionPublishedDrawIds({ tournamentRecords }).drawIds
    : undefined;

  if (publishedDrawIds?.length) {
    if (!params.contextFilters) params.contextFilters = {};
    if (!params.contextFilters?.drawIds) {
      params.contextFilters.drawIds = publishedDrawIds;
    } else {
      params.contextFilters.drawIds = params.contextFilters.drawIds.filter(
        (drawId) => publishedDrawIds.includes(drawId)
      );
    }
  }

  if (publishStatus?.eventIds?.length) {
    if (!params.matchUpFilters) params.matchUpFilters = {};
    if (params.matchUpFilters?.eventIds) {
      if (!params.matchUpFilters.eventIds.length) {
        params.matchUpFilters.eventIds = publishStatus.eventIds;
      } else {
        params.matchUpFilters.eventIds = params.matchUpFilters.eventIds.filter(
          (eventId) => publishStatus.eventIds.includes(eventId)
        );
      }
    } else {
      params.matchUpFilters.eventIds = publishStatus.eventIds;
    }
  }

  if (publishStatus?.scheduledDates?.length) {
    if (!params.matchUpFilters) params.matchUpFilters = {};
    if (params.matchUpFilters.scheduledDates) {
      if (!params.matchUpFilters.scheduledDates.length) {
        params.matchUpFilters.scheduledDates = publishStatus.scheduledDates;
      } else {
        params.matchUpFilters.scheduledDates =
          params.matchUpFilters.scheduledDates.filter((scheduledDate) =>
            publishStatus.scheduledDates.includes(scheduledDate)
          );
      }
    } else {
      params.matchUpFilters.scheduledDates = publishStatus.scheduledDates;
    }
  }

  // optimization: if all completed matchUps have already been retrieved, skip the hydration process
  if (alwaysReturnCompleted) {
    if (!params.matchUpFilters) params.matchUpFilters = {};
    if (params.matchUpFilters?.excludeMatchUpStatuses?.length) {
      if (!params.matchUpFilters.excludeMatchUpStatuses.includes(COMPLETED)) {
        params.matchUpFilters.excludeMatchUpStatuses.push(COMPLETED);
      }
    } else {
      params.matchUpFilters.excludeMatchUpStatuses = [COMPLETED];
    }
  }

  const { completedMatchUps, upcomingMatchUps, pendingMatchUps } =
    competitionMatchUps({
      ...params,
      matchUpFilters: params.matchUpFilters,
      contextFilters: params.contextFilters,
    });

  const relevantMatchUps = [
    ...(upcomingMatchUps ?? []),
    ...(pendingMatchUps ?? []),
  ];

  const dateMatchUps = sortDateMatchUps
    ? scheduledSortedMatchUps({ matchUps: relevantMatchUps, schedulingProfile })
    : relevantMatchUps;

  const courtsData = courts?.map((court) => {
    const matchUps = getCourtMatchUps(court);
    return {
      surfaceCategory: court?.surfaceCategory ?? '',
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
      ? dateMatchUps.concat(completedMatchUps ?? [])
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
    for (const event of tournamentRecord.events ?? []) {
      const { timeItem } = getEventTimeItem({
        itemType: `${PUBLISH}.${STATUS}`,
        event,
      });

      const pubState = timeItem?.itemValue?.[PUBLIC];
      if (pubState?.drawIds?.length) {
        drawIds.push(...pubState.drawIds);
      } else {
        // if there are no drawIds specified then all draws are published
        const eventDrawIds = (event.drawDefinitions ?? [])
          .map(({ drawId }) => drawId)
          .filter(Boolean);
        drawIds.push(...eventDrawIds);
      }
    }
  }

  return { drawIds };
}
