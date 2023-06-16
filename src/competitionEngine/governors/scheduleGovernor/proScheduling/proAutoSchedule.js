import { competitionScheduleMatchUps } from '../../../getters/competitionScheduleMatchUps';
import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import { bulkScheduleMatchUps } from '../bulkScheduleMatchUps';
import { matchUpSort } from '../../../../forge/transform';
import { isObject } from '../../../../utilities/objects';

import {
  INVALID_VALUES,
  MISSING_CONTEXT,
} from '../../../../constants/errorConditionConstants';

// NOTE: matchUps are assumed to be { inContext: true, nextMatchUps: true }
export function proAutoSchedule({
  tournamentRecords,
  scheduledDate,
  matchUps,
} = {}) {
  if (!Array.isArray(matchUps)) return { error: INVALID_VALUES };
  if (matchUps.some(({ hasContext }) => !hasContext)) {
    return {
      info: 'matchUps must have { inContext: true, nextMatchUps: true }',
      error: MISSING_CONTEXT,
    };
  }

  const matchUpFilters = { localPerspective: true, scheduledDate };
  let result = competitionScheduleMatchUps({
    courtCompletedMatchUps: true,
    withCourtGridRows: true,
    minCourtGridRows: 10,
    nextMatchUps: true,
    tournamentRecords,
    matchUpFilters,
  });
  if (result.error) return result;
  const { rows } = result;

  const gridMatchUps = [];

  const getMatchUpParticipantIds = (matchUp) =>
    [
      (matchUp.sides || []).map((side) => [
        side.participantId,
        side.participant?.individualParticipantIds,
      ]),
      (matchUp.potentialParticipants || [])
        .flat()
        .map((p) => [p.participantId, p.individualParticipantIds]),
    ]
      .flat(Infinity)
      .filter(Boolean);

  const gridRows = rows.reduce((gridRows, row) => {
    const matchUpIds = [],
      participantIds = [];
    Object.values(row).forEach((c) => {
      if (isObject(c)) {
        if (c.matchUpId) {
          matchUpIds.push(c.matchUpId);
          gridMatchUps.push(c);
        }
        if (c.sides) {
          const matchUpParticipantIds = getMatchUpParticipantIds(c);
          participantIds.push(...matchUpParticipantIds);
        }
      }
    });
    const availableCourts = Object.values(row).filter(
      (c) => isObject(c) && !c.matchUpId
    );
    return gridRows.concat({
      matchUpIds,
      availableCourts,
      rowId: row.rowId,
      participantIds,
    });
  }, []);

  matchUps.sort(matchUpSort);

  const deps = getMatchUpDependencies({
    matchUps: matchUps.concat(gridMatchUps),
    includeParticipantDependencies: true,
    tournamentRecords,
  }).matchUpDependencies;

  const previousRowMatchUpIds = [];
  const scheduled = [];

  while (matchUps.length && gridRows.length) {
    const row = gridRows.shift();
    const unscheduledMatchUps = [];
    while (matchUps.length && row.availableCourts.length) {
      const unscheduledMatchUpIds = matchUps
        .concat(unscheduledMatchUps)
        .map((m) => m.matchUpId);
      const matchUp = matchUps.shift();
      const { matchUpId } = matchUp;
      const linkedMatchUpIds = deps[matchUpId].matchUpIds.concat(
        deps[matchUpId].dependentMatchUpIds
      );
      const unscheduledContainSource = unscheduledMatchUpIds.some((id) =>
        deps[matchUpId].matchUpIds.includes(id)
      );
      const previousIncludesDependent = previousRowMatchUpIds.some((id) =>
        deps[matchUpId].dependentMatchUpIds.includes(id)
      );
      const rowIncludesLinked = row.matchUpIds.some((id) =>
        linkedMatchUpIds.includes(id)
      );

      const participantIds = getMatchUpParticipantIds(matchUp);
      const rowContainsParticipants = row.participantIds.some((id) =>
        participantIds.includes(id)
      );

      if (
        !rowIncludesLinked &&
        !unscheduledContainSource &&
        !rowContainsParticipants &&
        !previousIncludesDependent
      ) {
        const court = row.availableCourts.shift();
        Object.assign(matchUp.schedule, court.schedule);
        Object.assign(court, matchUp);

        scheduled.push(matchUp);

        row.participantIds.push(...participantIds);
        row.matchUpIds.push(matchUpId);
      } else {
        unscheduledMatchUps.push(matchUp);
      }
    }
    matchUps.push(...unscheduledMatchUps);
    previousRowMatchUpIds.push(...row.matchUpIds);
  }

  const matchUpDetails = scheduled.map(
    ({ matchUpId, tournamentId, schedule, drawId }) => ({
      tournamentId,
      matchUpId,
      drawId,
      schedule: {
        ...schedule,
        scheduledDate,
      },
    })
  );

  result = bulkScheduleMatchUps({ tournamentRecords, matchUpDetails });

  const notScheduled = matchUps;

  return { ...result, scheduled, notScheduled };
}
