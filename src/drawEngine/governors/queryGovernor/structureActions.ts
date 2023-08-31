import { getPlayoffStructures } from '../../../tournamentEngine/getters/structureGetter';
import { getStructureMatchUps } from '../../getters/getMatchUps/getStructureMatchUps';

import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { TEAM } from '../../../constants/matchUpTypes';

/**
 *
 * @param {object} drawDefinition - complete drawDefinition object
 * @param {string} structureId - UUID of structure to be found within drawDefinition
 *
 */
export function structureActions(params) {
  const actions = [];
  if (!params?.drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const isComplete = isCompletedStructure(params);
  const hasPlayoffPositionsFilled = allPlayoffPositionsFilled(params);
  return { actions, state: { isComplete, hasPlayoffPositionsFilled } };
}

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId
 */
export function isCompletedStructure(params) {
  if (!params?.drawDefinition) return false;
  const structureMatchUps = getStructureMatchUps(params);

  const includesTeamMatchUps = structureMatchUps?.includesTeamMatchUps;
  let { completedMatchUps, pendingMatchUps, upcomingMatchUps } =
    structureMatchUps || {};

  if (includesTeamMatchUps) {
    completedMatchUps = completedMatchUps?.filter(
      ({ matchUpType }) => matchUpType === TEAM
    );
    pendingMatchUps = pendingMatchUps?.filter(
      ({ matchUpType }) => matchUpType === TEAM
    );
    upcomingMatchUps = upcomingMatchUps?.filter(
      ({ matchUpType }) => matchUpType === TEAM
    );
  }

  const isComplete =
    completedMatchUps?.length &&
    !pendingMatchUps?.length &&
    !upcomingMatchUps?.length;

  return !!isComplete;
}

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId - either drawDefinition and structureId or structure
 * @param {object} structure - optional
 */
export function allPlayoffPositionsFilled(params) {
  const { drawDefinition, structureId } = params;
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { playoffStructures } = getPlayoffStructures({
    drawDefinition,
    structureId,
  });

  if (!playoffStructures?.length) return false;

  const enteredParticipantsCount =
    drawDefinition?.entries?.filter((entry) =>
      STRUCTURE_SELECTED_STATUSES.includes(entry?.entryStatus)
    )?.length || 0;

  let participantIdsCount = 0;
  const allPositionsFilled = (playoffStructures || []).reduce(
    (allFilled, structure) => {
      const structurePositionsFilled = !structure?.positionAssignments?.filter(
        (assignment) => {
          if (assignment.participantId) participantIdsCount++;
          return !assignment?.bye && !assignment?.participantId;
        }
      ).length;
      return structurePositionsFilled && allFilled;
    },
    true
  );

  // account for playoffStructure with only one participant
  const allParticipantIdsPlaced =
    participantIdsCount === enteredParticipantsCount;

  return allPositionsFilled || allParticipantIdsPlaced;
}
