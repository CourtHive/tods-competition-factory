import { getDrawPublishStatus } from '../../tournamentEngine/governors/publishingGovernor/getDrawPublishStatus';
import { getSchedulingProfile } from '../governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { scheduledSortedMatchUps } from '../../global/sorting/scheduledSortedMatchUps';
import { MatchUpFilters } from '../../drawEngine/getters/getMatchUps/filterMatchUps';
import { getTournamentId } from '../../global/state/globalState';
import { getVenuesAndCourts } from './venuesAndCourtsGetter';
import { courtGridRows } from '../generators/courtGridRows';
import { competitionMatchUps } from './matchUpsGetter';
import { isObject } from '../../utilities/objects';
import {
  getEventTimeItem,
  getTournamentTimeItem,
} from '../../tournamentEngine/governors/queryGovernor/timeItems';

import { MatchUpStatusEnum, Venue } from '../../types/tournamentFromSchema';
import { PUBLIC, PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { COMPLETED } from '../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../constants/resultConstants';
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

  // PUBLISH.STATUS is attached at the tournament level by `publishOrderOfPlay`
  const tournamentPublishStatus = usePublishState
    ? getTournamentTimeItem({
        tournamentRecord:
          tournamentRecords[activeTournamentId ?? getTournamentId()],
        itemType: `${PUBLISH}.${STATUS}`,
      }).timeItem?.itemValue?.[status]
    : undefined;

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

  // if { usePublishState: true } only return non-completed matchUps if there is orderOfPlay detail
  if (
    usePublishState &&
    (!tournamentPublishStatus || !Object.keys(tournamentPublishStatus).length)
  ) {
    return {
      completedMatchUps: allCompletedMatchUps,
      dateMatchUps: [],
      courtsData: [],
      venues,
    };
  }

  let publishedDrawIds, detailsMap;
  if (usePublishState) {
    ({ drawIds: publishedDrawIds, detailsMap } =
      getCompetitionPublishedDrawDetails({
        tournamentRecords,
      }));
  }

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

  if (tournamentPublishStatus?.eventIds?.length) {
    if (!params.matchUpFilters) params.matchUpFilters = {};
    if (params.matchUpFilters?.eventIds) {
      if (!params.matchUpFilters.eventIds.length) {
        params.matchUpFilters.eventIds = tournamentPublishStatus.eventIds;
      } else {
        params.matchUpFilters.eventIds = params.matchUpFilters.eventIds.filter(
          (eventId) => tournamentPublishStatus.eventIds.includes(eventId)
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
        params.matchUpFilters.scheduledDates =
          tournamentPublishStatus.scheduledDates;
      } else {
        params.matchUpFilters.scheduledDates =
          params.matchUpFilters.scheduledDates.filter((scheduledDate) =>
            tournamentPublishStatus.scheduledDates.includes(scheduledDate)
          );
      }
    } else {
      params.matchUpFilters.scheduledDates =
        tournamentPublishStatus.scheduledDates;
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

  const { completedMatchUps, upcomingMatchUps, pendingMatchUps, groupInfo } =
    competitionMatchUps({
      ...params,
      matchUpFilters: params.matchUpFilters,
      contextFilters: params.contextFilters,
    });

  let relevantMatchUps = [
    ...(upcomingMatchUps ?? []),
    ...(pendingMatchUps ?? []),
  ];

  // add any stage or structure filtering
  if (detailsMap) {
    relevantMatchUps = relevantMatchUps.filter((matchUp) => {
      const { drawId, structureId, stage } = matchUp;
      if (!detailsMap[drawId]) return false;
      if (detailsMap[drawId].stageDetails) {
        const stageKeys = Object.keys(detailsMap[drawId].stageDetails);
        const unpublishedStages = stageKeys.filter(
          (stage) => !detailsMap[drawId].stageDetails[stage].published
        );
        const publishedStages = stageKeys.filter(
          (stage) => detailsMap[drawId].stageDetails[stage].published
        );
        if (unpublishedStages.length && unpublishedStages.includes(stage))
          return false;
        if (publishedStages.length && publishedStages.includes(stage))
          return true;
        return (
          unpublishedStages.length &&
          !unpublishedStages.includes(stage) &&
          !publishedStages.length
        );
      }
      if (detailsMap[drawId].structureDetails) {
        const structureIdKeys = Object.keys(
          detailsMap[drawId].structureDetails
        );
        const unpublishedStructureIds = structureIdKeys.filter(
          (structureId) =>
            !detailsMap[drawId].structureDetails[structureId].published
        );
        const publishedStructureIds = structureIdKeys.filter(
          (structureId) =>
            detailsMap[drawId].structureDetails[structureId].published
        );
        if (
          unpublishedStructureIds.length &&
          unpublishedStructureIds.includes(structureId)
        )
          return false;
        if (
          publishedStructureIds.length &&
          publishedStructureIds.includes(structureId)
        )
          return true;
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
    completedMatchUps: alwaysReturnCompleted
      ? allCompletedMatchUps
      : completedMatchUps, // completed matchUps for the filter date
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
    result.courtPrefix = courtPrefix; // pass through for access to internal defaults by consumer
    result.rows = rows;
  }

  return { ...result, ...SUCCESS };

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

function getCompetitionPublishedDrawDetails({
  tournamentRecords,
}: TournamentRecordsArgs) {
  const drawIds: string[] = [];
  const detailsMap: { [key: string]: any } = {};

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    for (const event of tournamentRecord.events ?? []) {
      const eventPubState = getEventTimeItem({
        itemType: `${PUBLISH}.${STATUS}`,
        event,
      })?.timeItem?.itemValue?.[PUBLIC];

      const drawDetails = eventPubState?.drawDetails;

      if (isObject(drawDetails)) {
        Object.assign(detailsMap, drawDetails);
        drawIds.push(
          ...Object.keys(drawDetails).filter((drawId) =>
            getDrawPublishStatus({ drawId, drawDetails })
          )
        );
      } else if (eventPubState?.drawIds?.length) {
        // LEGACY - deprecate
        drawIds.push(...eventPubState.drawIds);
      }
    }
  }

  return { drawIds, detailsMap };
}
