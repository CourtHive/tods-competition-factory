import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import { matchUpSort } from '../../../../drawEngine/getters/matchUpSort';
import { generateRange, unique } from '../../../../utilities';

import { MISSING_MATCHUPS } from '../../../../constants/errorConditionConstants';
import {
  SCHEDULE_ISSUE_IDS,
  SCHEDULE_CONFLICT,
  SCHEDULE_WARNING,
  SCHEDULE_ERROR,
  SCHEDULE_ISSUE,
  SCHEDULE_STATE,
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
  const rowIndices = {};
  const courtIssues = {};

  const sortedFiltered = filteredRows.flat().filter(Boolean).sort(matchUpSort);

  sortedFiltered.forEach(({ schedule }) => delete schedule[SCHEDULE_STATE]);

  const drawIds = unique(matchUps.map(({ drawId }) => drawId));
  const deps = getMatchUpDependencies({
    drawIds,
  }).matchUpDependencies;
  const rowProfiles = filteredRows.map((row, rowIndex) =>
    row.reduce(
      (profile, matchUp) => {
        if (!matchUp.matchUpId) return profile;

        const { matchUpId, winnerMatchUpId, loserMatchUpId, schedule } =
          matchUp;
        const courtId = schedule?.courtId;
        rowIndices[matchUpId] = rowIndex;
        courtIssues[courtId] = [];

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

  const sourceDistance = (a, b) =>
    deps[a].sources.reduce(
      (distance, round, index) => (round.includes(b) && index + 1) || distance,
      0
    );

  const rowIssues = rowProfiles.map(() => []);
  const annotate = (id, issue, issueIds) => {
    if (!matchUpsMap[id].schedule[SCHEDULE_STATE]) {
      matchUpsMap[id].schedule[SCHEDULE_STATE] = issue;
      matchUpsMap[id].schedule[SCHEDULE_ISSUE_IDS] = issueIds;
      rowIssues[rowIndices[id]].push({ matchUpId: id, issue, issueIds });
      courtIssues[matchUpsMap[id].schedule.courtId] = issue;
    }
  };

  rowProfiles.forEach((row, rowIndex) => {
    row.matchUpIds.forEach((matchUpId) => {
      const sourceMatchUpIds = deps[matchUpId].matchUpIds;
      const previousRow = rowIndex ? rowProfiles[rowIndex - 1] : undefined;
      const subsequentRows = rowProfiles.slice(rowIndex + 1);

      // IMPORTANT: maintain order of annotations
      // SCHEDULE_STATE values progress from ERROR => CONFLICT => WARNING

      for (const subsequentRow of subsequentRows) {
        const sourceAfter = subsequentRow.matchUpIds.filter((id) =>
          sourceMatchUpIds.includes(id)
        );
        if (sourceAfter?.length) {
          sourceAfter.forEach((id) =>
            annotate(id, SCHEDULE_ERROR, [matchUpId])
          );
          annotate(matchUpId, SCHEDULE_ERROR, sourceAfter);
        }
      }

      // if the matchUpId is part of the sources for other row matchUps => conflict
      if (row.sourceMatchUpIds.includes(matchUpId)) {
        const sources = row.matchUpIds.filter((id) =>
          deps[id].matchUpIds.includes(matchUpId)
        );
        annotate(matchUpId, SCHEDULE_CONFLICT, sources);
        row.matchUpIds
          .filter((id) => deps[id].matchUpIds.includes(matchUpId))
          .forEach((id) => annotate(id, SCHEDULE_CONFLICT, [matchUpId]));
      }

      const insufficientGap = previousRow?.matchUpIds?.filter(
        (id) => sourceDistance(matchUpId, id) > 1
      );
      if (insufficientGap?.length) {
        annotate(matchUpId, SCHEDULE_ISSUE, insufficientGap);
        insufficientGap.forEach((id) =>
          annotate(id, SCHEDULE_ISSUE, [matchUpId])
        );
      }

      if (previousRow?.targetMatchUpIds?.includes(matchUpId)) {
        // IF: connected matchUps are on the same court with sufficient time between them
        // OR: connected matchUps are on the same court and the target matchUp has 'FOLLOWED_BY'
        // THEN: no WARNING will be given
        const consideredCourtId = matchUpsMap[matchUpId].schedule.courtId;
        const warningMatchUpIds = sourceMatchUpIds.filter((id) =>
          previousRow.matchUpIds.includes(id)
        );
        const allSameCourt = warningMatchUpIds.some(
          (id) => matchUpsMap[id].schedule.courtId === consideredCourtId
        );
        if (!allSameCourt) {
          warningMatchUpIds.forEach((id) =>
            annotate(id, SCHEDULE_WARNING, [matchUpId])
          );
          annotate(matchUpId, SCHEDULE_WARNING, warningMatchUpIds);
        }
      }
    });
  });

  return { courtIssues, rowIssues };
}
