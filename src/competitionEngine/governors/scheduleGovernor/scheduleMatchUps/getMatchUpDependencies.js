/**
 * Consider all matchUps which are already scheduled on target date
 * Consider all matchUps which are attempting to be scheduled on target date
 * Extract relevant drawIds
 * For each relevant drawDefinition build up a mapping of matchUp dependencies
 * {
 * 	[matchUpId]: matchUpIdDepdendencies
 * }
 * Filter matchUpIdDepdendencies array by matchUpIds which are on target date
 * When attempting to schedule a matchUp ensure that its depdendencies are already scheduled
 */

import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { matchUpSort } from '../../../../drawEngine/getters/matchUpSort';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_DRAW_ID,
  MISSING_MATCHUPS,
} from '../../../../constants/errorConditionConstants';

export function getMatchUpDependencies({
  tournamentRecords,
  matchUps = [],
  drawIds = [],
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };
  if (!Array.isArray(drawIds)) return { error: MISSING_DRAW_ID };

  if (!matchUps.length) {
    ({ matchUps } = allCompetitionMatchUps({
      tournamentRecords,
      nextMatchUps: true,
    }));
  }

  if (!drawIds.length) {
    drawIds = tournamentRecords
      ? Object.values(tournamentRecords)
          .map(({ events = [] }) =>
            events.map(({ drawDefinitions = [] }) =>
              drawDefinitions.map(({ drawId }) => drawId)
            )
          )
          .flat(Infinity)
      : [];
  }

  const matchUpDependencies = {};

  for (const drawId of drawIds) {
    const drawMatchUps = matchUps
      // first get all matchUps for the draw
      .filter((matchUp) => matchUp.drawId === drawId)
      .sort(matchUpSort);

    for (const matchUp of drawMatchUps) {
      const { matchUpId, winnerMatchUpId, loserMatchUpId } = matchUp;
      if (!matchUpDependencies[matchUpId]) matchUpDependencies[matchUpId] = [];
      if (winnerMatchUpId) {
        if (!matchUpDependencies[winnerMatchUpId]) {
          matchUpDependencies[winnerMatchUpId] = [];
        }

        matchUpDependencies[matchUpId].forEach((depdendentMatchUpId) => {
          matchUpDependencies[winnerMatchUpId].push(depdendentMatchUpId);
        });
        matchUpDependencies[winnerMatchUpId].push(matchUpId);
      }
      if (loserMatchUpId) {
        if (!matchUpDependencies[loserMatchUpId])
          matchUpDependencies[loserMatchUpId] = [];

        matchUpDependencies[matchUpId].forEach((depdendentMatchUpId) => {
          matchUpDependencies[loserMatchUpId].push(depdendentMatchUpId);
        });
        matchUpDependencies[loserMatchUpId].push(matchUpId);
      }
    }
  }

  return { matchUpDependencies, ...SUCCESS };
}
