import { assignTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/assignTieMatchUpParticipant';
import { setMatchUpStatus } from '../../../mutate/matchUps/matchUpStatus/setMatchUpStatus';
import { getAllStructureMatchUps } from '../../../query/matchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '../../../query/drawDefinition/positionsGetter';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { getParticipants } from '../../../query/participants/getParticipants';
import { getAllDrawMatchUps } from '../../../query/matchUps/drawMatchUps';
import { structureSort } from '../../../functions/sorters/structureSort';
import { matchUpSort } from '../../../functions/sorters/matchUpSort';
import { getMatchUpId } from '../../../global/functions/extractors';
import { generateLineUps } from '../participants/generateLineUps';
import { generateOutcome } from './generateOutcome';

import { BYE, COMPLETED, DOUBLE_DEFAULT, DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';
import { ErrorType, MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { addParticipants } from '../../../mutate/participants/addParticipants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { addExtension } from '../../../mutate/extensions/addExtension';
import { LINEUPS } from '../../../constants/extensionConstants';
import { ASCENDING } from '../../../constants/sortingConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { RANKING } from '../../../constants/scaleConstants';

export function completeDrawMatchUps(params): {
  completedCount?: number;
  success?: boolean;
  error?: ErrorType;
} {
  const {
    matchUpStatusProfile, // { matchUpStatusProfile: {} } will always return only { matchUpStatus: COMPLETED }
    completeAllMatchUps,
    // qualifyingProfiles, // CONSIDER: allowing completionGoal per structureProfile
    randomWinningSide,
    tournamentRecord,
    completionGoal,
    drawDefinition,
    event,
  } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const matchUpFormat = params.matchUpFormat || drawDefinition.matchUpFormat || event?.matchUpFormat;

  const sortedStructures = drawDefinition.structures.slice().sort(structureSort);

  let completedCount = 0;

  const { matchUps: firstRoundDualMatchUps, matchUpsMap } = getAllDrawMatchUps({
    contextFilters: {
      stages: [MAIN, QUALIFYING],
    },
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
    inContext: true,
    drawDefinition,
  });

  if (firstRoundDualMatchUps?.length) {
    const categoryName = event?.category?.ageCategoryCode || event?.category?.categoryName;
    if (categoryName) {
      const scaleAccessor = {
        scaleName: categoryName,
        sortOrder: ASCENDING,
        scaleType: RANKING,
      };
      const result = generateLineUps({
        singlesOnly: true,
        tournamentRecord,
        drawDefinition,
        scaleAccessor,
        event,
      });
      if (result.error) return result;
      const { lineUps, participantsToAdd } = result;
      addParticipants({ tournamentRecord, participants: participantsToAdd });
      const extension = { name: LINEUPS, value: lineUps };
      addExtension({ element: drawDefinition, extension });
    } else {
      const structureId = firstRoundDualMatchUps[0]?.structureId;
      const { positionAssignments } = getPositionAssignments({
        drawDefinition,
        structureId,
      });
      if (positionAssignments?.length) {
        const { participants: teamParticipants } = getParticipants({
          participantFilters: { participantTypes: [TEAM] },
          tournamentRecord,
        });
        const assignParticipants = (dualMatchUp) => {
          const singlesMatchUps = dualMatchUp.tieMatchUps.filter(({ matchUpType }) => matchUpType === SINGLES);
          const doublesMatchUps = dualMatchUp.tieMatchUps.filter(({ matchUpType }) => matchUpType === DOUBLES);

          singlesMatchUps.forEach((singlesMatchUp, i) => {
            const tieMatchUpId = singlesMatchUp.matchUpId;
            singlesMatchUp.sides.forEach((side) => {
              const { drawPosition } = side;
              const teamParticipant = teamParticipants?.find((teamParticipant) => {
                const { participantId } = teamParticipant;
                const assignment = positionAssignments.find((assignment) => assignment.participantId === participantId);
                return assignment?.drawPosition === drawPosition;
              });

              if (teamParticipant) {
                const individualParticipantId = teamParticipant.individualParticipantIds?.[i];

                individualParticipantId &&
                  assignTieMatchUpParticipantId({
                    teamParticipantId: teamParticipant.participantId,
                    participantId: individualParticipantId,
                    tournamentRecord,
                    drawDefinition,
                    tieMatchUpId,
                    event,
                  });
              }
            });
          });

          doublesMatchUps.forEach((doublesMatchUp, i) => {
            const tieMatchUpId = doublesMatchUp.matchUpId;
            doublesMatchUp.sides.forEach((side) => {
              const { drawPosition } = side;
              const teamParticipant = teamParticipants?.find((teamParticipant) => {
                const { participantId } = teamParticipant;
                const assignment = positionAssignments.find((assignment) => assignment.participantId === participantId);
                return assignment?.drawPosition === drawPosition;
              });

              if (teamParticipant) {
                const individualParticipantIds = teamParticipant.individualParticipantIds?.slice(i * 2, i * 2 + 2);
                individualParticipantIds?.forEach((individualParticipantId) => {
                  assignTieMatchUpParticipantId({
                    teamParticipantId: teamParticipant.participantId,
                    participantId: individualParticipantId,
                    tournamentRecord,
                    drawDefinition,
                    tieMatchUpId,
                    event,
                  });
                });
              }
            });
          });
        };

        firstRoundDualMatchUps.forEach(assignParticipants);
      }
    }
  }

  // to support legacy tests it is possible to use completeAllMatchUps
  // to pass a score string that will be applied to all matchUps
  const scoreString = typeof completeAllMatchUps === 'string' && completeAllMatchUps;
  const matchUpStatus = scoreString && COMPLETED;

  for (const structure of sortedStructures) {
    if (completedCount >= completionGoal) break;

    const { matchUps } = getAllStructureMatchUps({
      matchUpFilters: { matchUpTypes: [DOUBLES, SINGLES] },
      afterRecoveryTimes: false,
      tournamentRecord,
      inContext: true,
      drawDefinition,
      matchUpsMap,
      structure,
      event,
    });

    const sortedMatchUpIds = matchUps
      .filter(({ winningSide }) => !winningSide)
      .sort(matchUpSort)
      .map(getMatchUpId);

    for (const matchUpId of sortedMatchUpIds) {
      if (!isNaN(completionGoal) && completedCount >= completionGoal) break;

      const { matchUps } = getAllStructureMatchUps({
        matchUpFilters: { matchUpTypes: [DOUBLES, SINGLES] },
        afterRecoveryTimes: false,
        tournamentRecord,
        inContext: true,
        drawDefinition,
        matchUpsMap,
        structure,
        event,
      });

      const targetMatchUp = matchUps.find((matchUp) => matchUp.matchUpId === matchUpId);

      const isDoubleExit = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(targetMatchUp.matchUpStatus);

      if (targetMatchUp?.readyToScore && !isDoubleExit) {
        const result = smartComplete({
          winningSide: !randomWinningSide && 1,
          matchUpStatusProfile,
          tournamentRecord,
          drawDefinition,
          targetMatchUp,
          matchUpFormat,
          matchUpStatus,
          scoreString,
          event,
        });

        if (result?.error) return result;

        completedCount += 1;
      }
    }
  }

  return { ...SUCCESS, completedCount };
}

export function completeDrawMatchUp(params) {
  const {
    matchUpStatusCodes,
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    targetMatchUp,
    matchUpStatus,
    matchUpFormat,
    scoreString,
    winningSide,
    event,
  } = params;
  if (!targetMatchUp || targetMatchUp.matchUpStatus === BYE) {
    return;
  }
  const { matchUpId } = targetMatchUp || {};

  const { outcome } = generateOutcomeFromScoreString({
    matchUpFormat,
    matchUpStatus,
    scoreString,
    winningSide,
  });

  if (matchUpStatusCodes) outcome.matchUpStatusCodes = matchUpStatusCodes;

  return setMatchUpStatus({
    tournamentRecord,
    policyDefinitions,
    drawDefinition,
    matchUpFormat,
    matchUpId,
    outcome,
    event,
  });
}

// NOTE: matchUpFormat must come from collectionDefinition in TEAM events
function smartComplete(params) {
  const {
    matchUpStatusProfile = {},
    tournamentRecord,
    policyDefinitions,
    drawDefinition,
    matchUpStatus,
    matchUpFormat,
    targetMatchUp,
    scoreString,
    winningSide,
    event,
  } = params;

  if (scoreString || matchUpStatus) return completeDrawMatchUp(params);

  const { matchUpId } = targetMatchUp || {};
  const { outcome } = generateOutcome({
    matchUpStatusProfile,
    matchUpFormat,
    winningSide,
  });

  return setMatchUpStatus({
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUpId,
    outcome,
    event,
  });
}
