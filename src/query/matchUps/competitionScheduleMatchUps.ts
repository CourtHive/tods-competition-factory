import { getTournamentPublishStatus } from '@Query/tournaments/getTournamentPublishStatus';
import { getCompetitionPublishedDrawDetails } from './getCompetitionPublishedDrawDetails';
import { scheduledSortedMatchUps } from '@Functions/sorters/scheduledSortedMatchUps';
import { courtGridRows } from '../../assemblies/generators/scheduling/courtGridRows';
import { getSchedulingProfile } from '@Mutate/tournaments/schedulingProfile';
import { getVenuesAndCourts } from '../venues/venuesAndCourtsGetter';
import { getCompetitionMatchUps } from './getCompetitionMatchUps';
import { getTournamentId } from '@Global/state/globalState';

// constants and types
import { ErrorType, MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { MatchUpFilters, TournamentRecords } from '@Types/factoryTypes';
import { COMPLETED } from '@Constants/matchUpStatusConstants';
import { PUBLIC } from '@Constants/timeItemConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import { Venue } from '@Types/tournamentTypes';

type CompetitionScheduleMatchUpsArgs = {
  tournamentRecords: TournamentRecords;
  courtCompletedMatchUps?: boolean;
  alwaysReturnCompleted?: boolean;
  contextFilters?: MatchUpFilters;
  matchUpFilters?: MatchUpFilters;
  hydrateParticipants?: boolean;
  withCourtGridRows?: boolean;
  activeTournamentId?: string;
  sortDateMatchUps?: boolean;
  minCourtGridRows?: number;
  usePublishState?: boolean;
  sortCourtsData?: boolean;
  status?: string;
};

export function competitionScheduleMatchUps(params: CompetitionScheduleMatchUpsArgs): {
  completedMatchUps?: HydratedMatchUp[];
  dateMatchUps?: HydratedMatchUp[];
  courtPrefix?: string;
  error?: ErrorType;
  venues?: Venue[];
  courtsData?: any;
  rows?: any[];
} {
  if (typeof params?.tournamentRecords !== 'object' || !Object.keys(params?.tournamentRecords).length)
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

  // PUBLISH.STATUS is attached at the tournament level by `publishOrderOfPlay`
  const tournamentId = activeTournamentId ?? getTournamentId() ?? Object.keys(tournamentRecords)[0];
  const tournamentPublishStatus = usePublishState
    ? getTournamentPublishStatus({ tournamentRecord: tournamentRecords[tournamentId], status })
    : undefined;

  const allCompletedMatchUps = alwaysReturnCompleted
    ? getCompetitionMatchUps({
        ...params,
        matchUpFilters: {
          ...params.matchUpFilters,
          matchUpStatuses: [COMPLETED],
        },
        contextFilters: params.contextFilters,
      }).completedMatchUps
    : [];

  // if { usePublishState: true } return only completed matchUps unless orderOfPLay is published
  if (usePublishState && !tournamentPublishStatus?.orderOfPlay?.published) {
    return {
      completedMatchUps: allCompletedMatchUps,
      dateMatchUps: [],
      courtsData: [],
      venues,
    };
  }

  let publishedDrawIds, detailsMap;
  if (usePublishState) {
    ({ drawIds: publishedDrawIds, detailsMap } = getCompetitionPublishedDrawDetails({ tournamentRecords }));
  }

  if (publishedDrawIds?.length) {
    if (!params.contextFilters) params.contextFilters = {};
    if (!params.contextFilters?.drawIds) {
      params.contextFilters.drawIds = publishedDrawIds;
    } else {
      params.contextFilters.drawIds = params.contextFilters.drawIds.filter((drawId) =>
        publishedDrawIds.includes(drawId),
      );
    }
  }

  if (tournamentPublishStatus?.eventIds?.length) {
    if (!params.matchUpFilters) params.matchUpFilters = {};
    if (params.matchUpFilters?.eventIds) {
      if (!params.matchUpFilters.eventIds.length) {
        params.matchUpFilters.eventIds = tournamentPublishStatus.eventIds;
      } else {
        params.matchUpFilters.eventIds = params.matchUpFilters.eventIds.filter((eventId) =>
          tournamentPublishStatus.eventIds.includes(eventId),
        );
      }
    } else {
      params.matchUpFilters.eventIds = tournamentPublishStatus.eventIds;
    }
  }

  if (tournamentPublishStatus?.scheduledDates?.length) {
    if (!params.matchUpFilters) params.matchUpFilters = {};
    if (params.matchUpFilters.scheduledDates) {
      if (!params.matchUpFilters.scheduledDates.length) {
        params.matchUpFilters.scheduledDates = tournamentPublishStatus.scheduledDates;
      } else {
        params.matchUpFilters.scheduledDates = params.matchUpFilters.scheduledDates.filter((scheduledDate) =>
          tournamentPublishStatus.scheduledDates.includes(scheduledDate),
        );
      }
    } else {
      params.matchUpFilters.scheduledDates = tournamentPublishStatus.scheduledDates;
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

  const { completedMatchUps, upcomingMatchUps, pendingMatchUps, groupInfo } = getCompetitionMatchUps({
    ...params,
    matchUpFilters: params.matchUpFilters,
    contextFilters: params.contextFilters,
  });

  let relevantMatchUps = [...(upcomingMatchUps ?? []), ...(pendingMatchUps ?? [])];

  // add any stage or structure filtering
  // publishedDrawIds provides support for legacy timeItems
  if (detailsMap && (!publishedDrawIds?.length || Object.keys(detailsMap).length)) {
    relevantMatchUps = relevantMatchUps.filter((matchUp) => {
      const { drawId, structureId, stage } = matchUp;
      if (!detailsMap?.[drawId]?.publishingDetail?.published) return false;
      if (detailsMap[drawId].stageDetails) {
        const stageKeys = Object.keys(detailsMap[drawId].stageDetails);
        const unpublishedStages = stageKeys.filter((stage) => !detailsMap[drawId].stageDetails[stage].published);
        const publishedStages = stageKeys.filter((stage) => detailsMap[drawId].stageDetails[stage].published);
        if (unpublishedStages.length && unpublishedStages.includes(stage)) return false;
        if (publishedStages.length && publishedStages.includes(stage)) return true;
        return unpublishedStages.length && !unpublishedStages.includes(stage) && !publishedStages.length;
      }
      if (detailsMap[drawId].structureDetails) {
        const structureIdKeys = Object.keys(detailsMap[drawId].structureDetails);
        const unpublishedStructureIds = structureIdKeys.filter(
          (structureId) => !detailsMap[drawId].structureDetails[structureId].published,
        );
        const publishedStructureIds = structureIdKeys.filter(
          (structureId) => detailsMap[drawId].structureDetails[structureId].published,
        );
        if (unpublishedStructureIds.length && unpublishedStructureIds.includes(structureId)) return false;
        if (publishedStructureIds.length && publishedStructureIds.includes(structureId)) return true;
        return (
          unpublishedStructureIds.length &&
          !unpublishedStructureIds.includes(structureId) &&
          !publishedStructureIds.length
        );
      }
      return true;
    });
  }

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
    completedMatchUps: alwaysReturnCompleted ? allCompletedMatchUps : completedMatchUps, // completed matchUps for the filter date
    dateMatchUps, // all incomplete matchUps for the filter date
    courtsData,
    groupInfo,
    venues,
  };

  if (withCourtGridRows) {
    const { rows, courtPrefix } = courtGridRows({
      minRowsCount: minCourtGridRows,
      courtsData,
    });
    result.courtPrefix = courtPrefix; /* pass through for access to internal defaults by consumer */
    result.rows = rows;
  }

  return { ...result, ...SUCCESS };

  function getCourtMatchUps({ courtId }) {
    const matchUpsToConsider = courtCompletedMatchUps ? dateMatchUps.concat(completedMatchUps ?? []) : dateMatchUps;
    const courtMatchUps = matchUpsToConsider.filter(
      (matchUp) =>
        matchUp.schedule?.courtId === courtId ||
        matchUp.schedule?.allocatedCourts?.map(({ courtId }) => courtId).includes(courtId),
    );

    return sortCourtsData
      ? scheduledSortedMatchUps({
          matchUps: courtMatchUps,
          schedulingProfile,
        })
      : courtMatchUps;
  }
}
