import { assignTieMatchUpParticipantId } from '../../tournamentEngine/governors/eventGovernor/assignTieMatchUpParticipant';
import { getTournamentParticipants } from '../../tournamentEngine/getters/participants/getTournamentParticipants';
import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { setMatchUpStatus } from '../../tournamentEngine/governors/eventGovernor/setMatchUpStatus';
import { getAllDrawMatchUps } from '../../drawEngine/getters/getMatchUps/drawMatchUps';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { getPositionAssignments } from '../../drawEngine/getters/positionsGetter';
import { structureSort } from '../../drawEngine/getters/structureSort';
import { matchUpSort } from '../../drawEngine/getters/matchUpSort';
import { getMatchUpId } from '../../global/functions/extractors';
import { generateOutcome } from './generateOutcome';

import { MAIN, QUALIFYING } from '../../constants/drawDefinitionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../constants/matchUpTypes';
import { SUCCESS } from '../../constants/resultConstants';
import {
  BYE,
  COMPLETED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
} from '../../constants/matchUpStatusConstants';

export function completeDrawMatchUps({
  matchUpStatusProfile,
  completeAllMatchUps,
  // qualifyingProfiles, // CONSIDER: allowing completionGoal per structureProfile
  randomWinningSide,
  tournamentRecord,
  drawDefinition,
  completionGoal,
  matchUpFormat,
  event,
}) {
  const sortedStructures = drawDefinition.structures
    .slice()
    .sort(structureSort);

  let completedCount = 0;

  let { matchUps: firstRoundDualMatchUps, matchUpsMap } = getAllDrawMatchUps({
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

  if (firstRoundDualMatchUps.length) {
    const structureId = firstRoundDualMatchUps[0]?.structureId;
    const { positionAssignments } = getPositionAssignments({
      drawDefinition,
      structureId,
    });
    if (positionAssignments?.length) {
      let { tournamentParticipants: teamParticipants } =
        getTournamentParticipants({
          participantFilters: { participantTypes: [TEAM] },
          tournamentRecord,
        });
      const assignParticipants = (dualMatchUp) => {
        const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
          ({ matchUpType }) => matchUpType === SINGLES
        );
        const doublesMatchUps = dualMatchUp.tieMatchUps.filter(
          ({ matchUpType }) => matchUpType === DOUBLES
        );

        singlesMatchUps.forEach((singlesMatchUp, i) => {
          const tieMatchUpId = singlesMatchUp.matchUpId;
          singlesMatchUp.sides.forEach((side) => {
            const { drawPosition } = side;
            const teamParticipant = teamParticipants.find((teamParticipant) => {
              const { participantId } = teamParticipant;
              const assignment = positionAssignments.find(
                (assignment) => assignment.participantId === participantId
              );
              return assignment.drawPosition === drawPosition;
            });

            if (teamParticipant) {
              const individualParticipantId =
                teamParticipant.individualParticipantIds[i];
              const result = assignTieMatchUpParticipantId({
                participantId: individualParticipantId,
                tournamentRecord,
                drawDefinition,
                tieMatchUpId,
                event,
              });

              if (!result.success) console.log(result);
            }
          });
        });

        doublesMatchUps.forEach((doublesMatchUp, i) => {
          const tieMatchUpId = doublesMatchUp.matchUpId;
          doublesMatchUp.sides.forEach((side) => {
            const { drawPosition } = side;
            const teamParticipant = teamParticipants.find((teamParticipant) => {
              const { participantId } = teamParticipant;
              const assignment = positionAssignments.find(
                (assignment) => assignment.participantId === participantId
              );
              return assignment.drawPosition === drawPosition;
            });

            if (teamParticipant) {
              const individualParticipantIds =
                teamParticipant.individualParticipantIds.slice(
                  i * 2,
                  i * 2 + 2
                );
              individualParticipantIds.forEach((individualParticipantId) => {
                const result = assignTieMatchUpParticipantId({
                  participantId: individualParticipantId,
                  tournamentRecord,
                  drawDefinition,
                  tieMatchUpId,
                  event,
                });
                if (!result.success) console.log(result);
              });
            }
          });
        });
      };

      firstRoundDualMatchUps.forEach(assignParticipants);
    }
  }

  // to support legacy tests it is possible to use completeAllMatchUps
  // to pass a score string that will be applied to all matchUps
  const scoreString =
    typeof completeAllMatchUps === 'string' && completeAllMatchUps;
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

      const targetMatchUp = matchUps.find(
        (matchUp) => matchUp.matchUpId === matchUpId
      );

      const isDoubleExit = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(
        targetMatchUp.matchUpStatus
      );

      if (targetMatchUp?.readyToScore && !isDoubleExit) {
        const result = smartComplete({
          winningSide: !randomWinningSide && 1,
          matchUpStatusProfile,
          drawDefinition,
          targetMatchUp,
          matchUpFormat,
          matchUpStatus,
          scoreString,
        });

        if (result.error) return result;

        completedCount += 1;
      }
    }
  }
  return { ...SUCCESS, completedCount };
}

export function completeDrawMatchUp({
  matchUpStatusCodes,
  drawDefinition,
  targetMatchUp,
  matchUpStatus,
  matchUpFormat,
  scoreString,
  winningSide,
}) {
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
    drawDefinition,
    matchUpFormat,
    matchUpId,
    outcome,
  });
}

// NOTE: matchUpFormat must come from collectionDefinition in TEAM events
function smartComplete(params) {
  const {
    matchUpStatusProfile = {},
    drawDefinition,
    matchUpStatus,
    matchUpFormat,
    targetMatchUp,
    scoreString,
    winningSide,
  } = params;

  if (scoreString || matchUpStatus) return completeDrawMatchUp(params);

  const { matchUpId } = targetMatchUp || {};
  const { outcome } = generateOutcome({
    matchUpStatusProfile,
    matchUpFormat,
    winningSide,
  });

  return setMatchUpStatus({
    matchUpFormat,
    drawDefinition,
    matchUpId,
    outcome,
  });
}
