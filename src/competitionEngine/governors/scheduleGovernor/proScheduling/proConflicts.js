import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import { matchUpSort } from '../../../../drawEngine/getters/matchUpSort';
import { generateRange, unique } from '../../../../utilities';

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
      .map(({ schedule }) => schedule?.courtOrder || 1)
      .map((order) => parseInt(order))
  );
  const filteredRows = generateRange(1, maxCourtOrder + 1).map((courtOrder) =>
    matchUps.filter((m) => parseInt(m.schedule?.courtOrder) === courtOrder)
  );
  const matchUpsMap = {};

  const sortedFiltered = filteredRows.flat().filter(Boolean).sort(matchUpSort);
  sortedFiltered.forEach(({ schedule }) => {
    delete schedule[SCHEDULE_CONFLICT];
    delete schedule[SCHEDULE_WARNING];
    delete schedule[SCHEDULE_ERROR];
  });

  const drawIds = unique(matchUps.map(({ drawId }) => drawId));
  const deps = getMatchUpDependencies({ drawIds }).matchUpDependencies;

  const rowProfiles = filteredRows.map((row) =>
    row.reduce(
      (profile, matchUp) => {
        const { matchUpId, winnerMatchUpId, loserMatchUpId } = matchUp;
        profile.matchUpIds.push(matchUpId);
        matchUpsMap[matchUpId] = matchUp;

        const sourceMatchUpIds = deps[matchUpId].matchUpIds;
        sourceMatchUpIds.length &&
          profile.sourceMatchUpIds.push(...sourceMatchUpIds);

        winnerMatchUpId && profile.targetMatchUpIds.push(winnerMatchUpId);
        loserMatchUpId && profile.targetMatchUpIds.push(loserMatchUpId);

        return profile;
      },
      { matchUpIds: [], sourceMatchUpIds: [], targetMatchUpIds: [] }
    )
  );

  const annotate = (id, attr) => (matchUpsMap[id].schedule[attr] = true);

  rowProfiles.forEach((row, i) => {
    row.matchUpIds.forEach((matchUpId) => {
      const sourceMatchUpIds = deps[matchUpId].matchUpIds;
      const { winnerMatchUpId, loserMatchUpId } = matchUpsMap[matchUpId];
      const previousRow = i && rowProfiles[i - 1];
      const subsequentRows = rowProfiles.slice(i + 1);

      // if the winner or loser matchUpId are part of row matchUpIds => conflict
      [winnerMatchUpId, loserMatchUpId].forEach(
        (id) =>
          row.matchUpIds.includes(id) && annotate(matchUpId, SCHEDULE_CONFLICT)
      );
      // if the matchUpId is part of the sources for other row matchUps => conflict
      if (row.sourceMatchUpIds.includes(matchUpId)) {
        annotate(matchUpId, SCHEDULE_CONFLICT);
        row.matchUpIds
          .filter((id) => deps[id].matchUpIds.includes(matchUpId))
          .forEach((id) => annotate(id, SCHEDULE_CONFLICT));
      }

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
