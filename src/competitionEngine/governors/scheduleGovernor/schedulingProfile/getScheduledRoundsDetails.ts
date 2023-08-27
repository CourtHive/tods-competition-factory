import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { filterMatchUps } from '../../../../drawEngine/getters/getMatchUps/filterMatchUps';
import { findMatchUpFormatTiming } from '../matchUpFormatTiming/findMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { matchUpSort } from '../../../../drawEngine/getters/matchUpSort';
import { getMatchUpId } from '../../../../global/functions/extractors';
import { mustBeAnArray } from '../../../../utilities/mustBeAnArray';
import { isConvertableInteger } from '../../../../utilities/math';
import { isPowerOf2 } from '../../../../utilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';
import {
  BYE,
  completedMatchUpStatuses,
} from '../../../../constants/matchUpStatusConstants';
import { Tournament } from '../../../../types/tournamentFromSchema';
import { HydratedMatchUp } from '../../../../types/hydrated';

/**
 *
 * @param {object} tournamentRecords - passed in automatically by competitionEngine
 * @param {string[]} containedStructureIds - optional optimization - otherwise created internally
 * @param {integer} periodLength - optional - defaults to 30
 * @param {object[]} matchUps - optional optimization - otherwise created internally
 * @param {object[]} rounds - array of ordered rounds specified as part of a schedulingProfile
 * @returns
 */

type GetScheduledRoundsDetailsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  scheduleCompletedMatchUps?: boolean;
  containedStructureIds?: string[];
  matchUps?: HydratedMatchUp[];
  periodLength?: number;
  rounds: any[];
};
type RoundsDetailsResult = {
  greatestAverageMinutes?: number;
  scheduledRoundsDetails?: any[];
  orderedMatchUpIds?: string[];
  matchUpFormatCohorts?: any; // currently unused
  recoveryMinutesMap?: any;
  averageMinutesMap?: any;
  error?: ErrorType;
  success?: boolean;
  minutesMap?: any;
  info?: string;
};
export function getScheduledRoundsDetails({
  scheduleCompletedMatchUps,
  containedStructureIds, // optional to support calling method outside of scheduleProfileRounds
  tournamentRecords,
  periodLength = 30,
  matchUps, // optional to support calling method outside of scheduleProfileRounds
  rounds,
}: GetScheduledRoundsDetailsArgs): RoundsDetailsResult {
  if (typeof tournamentRecords !== 'object')
    return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(rounds))
    return { error: MISSING_VALUE, info: mustBeAnArray('rounds') };

  const matchUpFormatCohorts = {};
  const hashes: string[] = [];
  const orderedMatchUpIds: string[] = [];
  const sortedRounds = rounds.sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );

  // ---------------------------------------------------------
  // populate required variables if not provided by parameters
  containedStructureIds =
    containedStructureIds ||
    Object.assign(
      {},
      ...Object.values(tournamentRecords).map(
        (tournamentRecord) =>
          getContainedStructures({ tournamentRecord }).containedStructures
      )
    );

  if (!matchUps) {
    ({ matchUps } = allCompetitionMatchUps({
      nextMatchUps: true,
      tournamentRecords,
    }));
  }
  // ---------------------------------------------------------

  let greatestAverageMinutes = 0;
  const recoveryMinutesMap = {};
  const averageMinutesMap = {};
  const minutesMap = {};

  const scheduledRoundsDetails = sortedRounds.flatMap((round) => {
    const roundPeriodLength = round.periodLength || periodLength;
    const structureIds = containedStructureIds?.[round.structureId] || [
      round.structureId,
    ];
    const roundMatchUpFilters = {
      tournamentIds: [round.tournamentId],
      roundNumbers: [round.roundNumber],
      matchUpIds: round.matchUpIds,
      eventIds: [round.eventId],
      drawIds: [round.drawId],
      structureIds,
    };
    let roundMatchUps = matchUps
      ? filterMatchUps({
          ...roundMatchUpFilters,
          processContext: true,
          matchUps,
        }).sort(matchUpSort)
      : [];

    // filter by roundSegment
    const { segmentNumber, segmentsCount } = round.roundSegment || {};

    if (
      isConvertableInteger(segmentNumber) &&
      isPowerOf2(roundMatchUps?.length) &&
      isPowerOf2(segmentsCount) &&
      segmentNumber > 0 &&
      segmentNumber <= segmentsCount &&
      segmentsCount < roundMatchUps?.length &&
      !round.matchUpIds?.length
    ) {
      const segmentSize = roundMatchUps.length / segmentsCount;
      const firstSegmentIndex = segmentSize * (segmentNumber - 1);
      roundMatchUps = roundMatchUps.slice(
        firstSegmentIndex,
        firstSegmentIndex + segmentSize
      );
    }

    const tournamentRecord = tournamentRecords[round.tournamentId];
    const { event } = findEvent({
      drawId: round.drawId,
      tournamentRecord,
    });

    const matchUpFormatOrder: string[] = [];
    for (const matchUp of roundMatchUps) {
      const matchUpFormat = matchUp.matchUpFormat;
      if (matchUpFormat) {
        if (!matchUpFormatCohorts[matchUpFormat]) {
          matchUpFormatCohorts[matchUpFormat] = [];
          matchUpFormatCohorts[matchUpFormat].push(matchUp);
        }
        matchUpFormatOrder.push(matchUpFormat);
      }
    }

    for (const matchUpFormat of matchUpFormatOrder) {
      const { eventType, category, categoryType } = event || {};
      const { categoryName, ageCategoryCode } = category || {};
      const {
        typeChangeRecoveryMinutes,
        recoveryMinutes,
        averageMinutes,
        error,
      } = findMatchUpFormatTiming({
        categoryName: categoryName || ageCategoryCode,
        tournamentId: round.tournamentId,
        eventId: round.eventId,
        tournamentRecords,
        matchUpFormat,
        categoryType,
        eventType,
      });
      if (error) return { error, round };

      const matchUpIds = roundMatchUps
        .filter(
          (rm: any) =>
            // don't attempt to scheduled completed matchUpstatuses unless explicit override
            (scheduleCompletedMatchUps ||
              !completedMatchUpStatuses.includes(rm.matchUpStatus)) &&
            rm.matchUpStatus !== BYE
        )
        .map(getMatchUpId);

      matchUpIds.forEach((matchUpId) => {
        minutesMap[matchUpId] = {
          typeChangeRecoveryMinutes,
          recoveryMinutes,
          averageMinutes,
        };
        recoveryMinutesMap[matchUpId] = recoveryMinutes;
        averageMinutesMap[matchUpId] = averageMinutes;
      });
      orderedMatchUpIds.push(...matchUpIds);

      greatestAverageMinutes = Math.max(
        averageMinutes || 0,
        greatestAverageMinutes
      );
      const hash = `${averageMinutes}|${roundPeriodLength}`;
      if (!hashes.includes(hash)) hashes.push(hash);

      return {
        roundPeriodLength,
        recoveryMinutes,
        averageMinutes,
        matchUpIds,
        hash,
      };
    }
    return undefined;
  });

  return {
    scheduledRoundsDetails,
    greatestAverageMinutes,
    matchUpFormatCohorts,
    recoveryMinutesMap,
    averageMinutesMap,
    orderedMatchUpIds,
    minutesMap,
    ...SUCCESS,
  };
}
