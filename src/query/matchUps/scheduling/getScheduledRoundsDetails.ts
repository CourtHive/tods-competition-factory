import { getContainedStructures } from '../../drawDefinition/getContainedStructures';
import { allCompetitionMatchUps } from '../../matchUps/getAllCompetitionMatchUps';
import { findMatchUpFormatTiming } from '../../../acquire/findMatchUpFormatTiming';
import { isConvertableInteger, isPowerOf2 } from '@Tools/math';
import { matchUpSort } from '@Functions/sorters/matchUpSort';
import { getMatchUpId } from '@Functions/global/extractors';
import { mustBeAnArray } from '@Tools/mustBeAnArray';
import { findEvent } from '../../../acquire/findEvent';
import { filterMatchUps } from '../../filterMatchUps';

import { Tournament } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import { ErrorType, MISSING_TOURNAMENT_RECORDS, MISSING_VALUE } from '@Constants/errorConditionConstants';
import { BYE, completedMatchUpStatuses } from '@Constants/matchUpStatusConstants';

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
  if (typeof tournamentRecords !== 'object') return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(rounds)) return { error: MISSING_VALUE, info: mustBeAnArray('rounds') };

  const matchUpFormatCohorts = {};
  const hashes: string[] = [];
  const orderedMatchUpIds: string[] = [];
  rounds.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // ---------------------------------------------------------
  // populate required variables if not provided by parameters
  containedStructureIds =
    containedStructureIds ??
    Object.assign(
      {},
      ...Object.values(tournamentRecords).map(
        (tournamentRecord) => getContainedStructures({ tournamentRecord }).containedStructures,
      ),
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

  const scheduledRoundsDetails = rounds.flatMap((round) => {
    const roundPeriodLength = round.periodLength || periodLength;
    const structureIds: string[] = [];
    if (containedStructureIds?.[round.structureId]) {
      structureIds.push(...containedStructureIds[round.structureId]);
    } else {
      structureIds.push(round.structureId);
    }
    let roundMatchUps = matchUps
      ? filterMatchUps({
          tournamentIds: [round.tournamentId],
          roundNumbers: [round.roundNumber],
          matchUpIds: round.matchUpIds,
          eventIds: [round.eventId],
          drawIds: [round.drawId],
          processContext: true,
          structureIds,
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
      roundMatchUps = roundMatchUps.slice(firstSegmentIndex, firstSegmentIndex + segmentSize);
    }

    const tournamentRecord = tournamentRecords[round.tournamentId];
    const event = findEvent({
      drawId: round.drawId,
      tournamentRecord,
    }).event;

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
      const { eventType, category } = event ?? {};
      const { categoryName, ageCategoryCode } = category ?? {};
      const { typeChangeRecoveryMinutes, recoveryMinutes, averageMinutes, error } = findMatchUpFormatTiming({
        categoryName: categoryName ?? ageCategoryCode,
        categoryType: category?.categoryType,
        tournamentId: round.tournamentId,
        eventId: round.eventId,
        tournamentRecords,
        matchUpFormat,
        eventType,
      });
      if (error) return { error, round };

      const matchUpIds = roundMatchUps
        .filter(
          (rm: any) =>
            // don't attempt to scheduled completed matchUpstatuses unless explicit override
            (scheduleCompletedMatchUps || !completedMatchUpStatuses.includes(rm.matchUpStatus)) &&
            rm.matchUpStatus !== BYE,
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

      greatestAverageMinutes = Math.max(averageMinutes || 0, greatestAverageMinutes);
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
