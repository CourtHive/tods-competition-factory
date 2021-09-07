import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { filterMatchUps } from '../../../../drawEngine/getters/getMatchUps/filterMatchUps';
import { getMatchUpFormat } from '../../../../tournamentEngine/getters/getMatchUpFormat';
import { findMatchUpFormatTiming } from '../matchUpFormatTiming/findMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { isConvertableInteger } from '../../../../utilities/math';
import { isPowerOf2 } from '../../../../utilities';

import {
  BYE,
  completedMatchUpStatuses,
} from '../../../../constants/matchUpStatusConstants';

export function getScheduledRoundDetails({
  tournamentRecords,
  containedStructureIds, // optional to support calling method outside of scheduleProfileRounds
  periodLength,
  matchUps, // optional to support calling method outside of scheduleProfileRounds
  rounds,
}) {
  const hashes = [];
  const sortedRounds = rounds.sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );
  containedStructureIds =
    containedStructureIds ||
    Object.assign(
      {},
      ...Object.values(tournamentRecords).map(getContainedStructures)
    );

  if (!matchUps) {
    ({ matchUps } = allCompetitionMatchUps({
      tournamentRecords,
      nextMatchUps: true,
    }));
  }

  const recoveryMinutesMap = {};
  let greatestAverageMinutes = 0;
  const scheduledRoundsDetails = sortedRounds.map((round) => {
    const roundPeriodLength = round.periodLength || periodLength;
    const structureIds = containedStructureIds[round.structureId] || [
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
    let roundMatchUps = filterMatchUps({
      matchUps,
      processContext: true,
      ...roundMatchUpFilters,
    });

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
    const { drawDefinition, event } = findEvent({
      tournamentRecord,
      drawId: round.drawId,
    });
    const { matchUpFormat } = getMatchUpFormat({
      tournamentRecord,
      structureId: round.structureId,
      drawDefinition,
      event,
    });

    const { eventType, category } = event || {};
    const { categoryName, ageCategoryCode } = category || {};
    const { averageMinutes, recoveryMinutes, error } = findMatchUpFormatTiming({
      tournamentRecords,
      categoryName: categoryName || ageCategoryCode,
      tournamentId: round.tournamentId,
      eventId: round.eventId,
      matchUpFormat,
      eventType,
    });
    if (error) return { error, round };

    const matchUpIds = roundMatchUps
      .filter(
        ({ matchUpStatus }) =>
          // don't attempt to scheduled completed matchUpstatuses
          !completedMatchUpStatuses.includes(matchUpStatus) &&
          matchUpStatus !== BYE
      )
      .map(({ matchUpId }) => matchUpId);
    matchUpIds.forEach(
      (matchUpId) => (recoveryMinutesMap[matchUpId] = recoveryMinutes)
    );

    greatestAverageMinutes = Math.max(
      averageMinutes || 0,
      greatestAverageMinutes
    );
    const hash = `${averageMinutes}|${roundPeriodLength}`;
    if (!hashes.includes(hash)) hashes.push(hash);

    return {
      hash,
      matchUpIds,
      averageMinutes,
      recoveryMinutes,
      roundPeriodLength,
    };
  });

  return { scheduledRoundsDetails, recoveryMinutesMap, greatestAverageMinutes };
}
