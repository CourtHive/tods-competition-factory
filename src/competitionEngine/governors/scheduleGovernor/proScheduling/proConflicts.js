import { generateRange } from '../../../../utilities';

import { MISSING_MATCHUPS } from '../../../../constants/errorConditionConstants';
import {
  SCHEDULE_CONFLICT,
  SCHEDULE_ERROR,
  SCHEDULE_WARNING,
} from '../../../../constants/scheduleConstants';

export function proConflicts({ matchUps }) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };
  const maxCourtOrder = Math.max(
    ...matchUps
      .map(({ schedule }) => schedule.courtOrder)
      .map((order) => parseInt(order))
  );
  const filteredRows = generateRange(1, maxCourtOrder + 1).map((courtOrder) =>
    matchUps.filter((m) => parseInt(m.schedule.courtOrder) === courtOrder)
  );
  const dependencies = {};
  const matchUpsMap = {};

  const initializeMatchUpId = (matchUpId) =>
    !dependencies[matchUpId] &&
    (dependencies[matchUpId] = {
      targetMatchUpIds: [],
      sourceMatchUpIds: [],
    });

  filteredRows
    .flat()
    .filter(Boolean)
    .forEach(({ matchUpId, winnerMatchUpId, loserMatchUpId, schedule }) => {
      initializeMatchUpId(winnerMatchUpId);
      initializeMatchUpId(loserMatchUpId);
      initializeMatchUpId(matchUpId);

      delete schedule[SCHEDULE_CONFLICT];
      delete schedule[SCHEDULE_WARNING];
      delete schedule[SCHEDULE_ERROR];

      if (winnerMatchUpId) {
        dependencies[matchUpId].targetMatchUpIds.push(winnerMatchUpId);
        dependencies[winnerMatchUpId].sourceMatchUpIds.push(matchUpId);
      }

      if (loserMatchUpId) {
        dependencies[matchUpId].targetMatchUpIds.push(loserMatchUpId);
        dependencies[loserMatchUpId].sourceMatchUpIds.push(matchUpId);
      }
    });

  const rowProfiles = filteredRows.map((row) =>
    row.reduce(
      (profile, matchUp) => {
        const { matchUpId, winnerMatchUpId, loserMatchUpId } = matchUp;
        profile.matchUpIds.push(matchUpId);
        matchUpsMap[matchUpId] = matchUp;

        winnerMatchUpId && profile.targetMatchUpIds.push(winnerMatchUpId);
        loserMatchUpId && profile.targetMatchUpIds.push(loserMatchUpId);

        return profile;
      },
      { matchUpIds: [], targetMatchUpIds: [] }
    )
  );

  const annotate = (id, attr) => (matchUpsMap[id].schedule[attr] = true);

  rowProfiles.forEach((row, i) => {
    row.matchUpIds.forEach((matchUpId) => {
      const { sourceMatchUpIds } = dependencies[matchUpId];
      const { winnerMatchUpId, loserMatchUpId } = matchUpsMap[matchUpId];
      const previousRow = i && rowProfiles[i - 1];
      const subsequentRows = rowProfiles.slice(i + 1);

      // if the winner or loser matchUpId are part of row matchUpIds => conflict
      [winnerMatchUpId, loserMatchUpId].forEach(
        (id) =>
          row.matchUpIds.includes(id) && annotate(matchUpId, SCHEDULE_CONFLICT)
      );
      // if the matchUpId is part of the target for other row matchUps => conflict
      row.targetMatchUpIds.includes(matchUpId) &&
        annotate(matchUpId, SCHEDULE_CONFLICT);

      if (previousRow?.targetMatchUpIds?.includes(matchUpId)) {
        // IF: connected matchUps are on the same court with sufficient time between them
        // OR: connected matchUps are on the same court and the target matchUp has 'FOLLOWED_BY'
        // THEN: no WARNING will be given
        const consideredCourtId = matchUpsMap[matchUpId].schedule.courtId;
        const warningMatchUpIds = sourceMatchUpIds.filter((id) =>
          previousRow.matchUpIds.includes(id)
        );
        const allSameCourt = warningMatchUpIds.every(
          (id) => matchUpsMap[id].schedule.courtId === consideredCourtId
        );
        if (!allSameCourt) {
          warningMatchUpIds.forEach((id) => annotate(id, SCHEDULE_WARNING));
          annotate(matchUpId, SCHEDULE_WARNING);
        }
      }

      for (const subsequentRow of subsequentRows) {
        const sourceAfter = subsequentRow.matchUpIds.filter((id) =>
          sourceMatchUpIds.includes(id)
        );
        if (sourceAfter?.length) {
          sourceAfter.forEach((id) => annotate(id, SCHEDULE_ERROR));
          annotate(matchUpId, SCHEDULE_ERROR);
        }
      }
    });
  });
}
