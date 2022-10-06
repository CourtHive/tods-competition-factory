import { getAllStructureMatchUps } from '../../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getMatchUpsMap } from '../../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';
import { toBePlayed } from '../../../../fixtures/scoring/outcomes/toBePlayed';
import { BYE } from '../../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MAIN,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';
import {
  ASSIGN_COURT,
  ASSIGN_VENUE,
  ASSIGN_OFFICIAL,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
} from '../../../../constants/timeItemConstants';

export function resetDrawDefinition({
  tournamentRecord,
  removeScheduling,
  drawDefinition,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  // for matchups in all structures:
  // remove all drawPositions which are not first round or fed
  // remove all extensions
  // if removeScheudling, remove all scheduling timeItems

  // for all structures which are NOT QUALIFYING or MAIN { stageSequence: 1 }
  // remove all positionAssignments that are not BYE

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  const getRawMatchUp = (matchUpId) =>
    matchUpsMap?.drawMatchUps?.find(
      (matchUp) => matchUp.matchUpId === matchUpId
    );

  for (const structure of drawDefinition.structures || []) {
    const { positionAssignments, stage, stageSequence } = structure;

    // reset positionAssignments and seedAssignments where appropriate
    if (
      positionAssignments &&
      (stageSequence !== 1 || ![QUALIFYING, MAIN].includes(stage))
    ) {
      structure.positionAssignments = positionAssignments.map((assignment) => {
        delete assignment.participantId;
        return assignment;
      });
      structure.seedAssignments = [];
    }

    const { matchUps: inContextMatchUps } = getAllStructureMatchUps({
      afterRecoveryTimes: false,
      inContext: true,
      matchUpsMap,
      structure,
    });

    // reset all matchUps to initial state
    for (const inContextMatchUp of inContextMatchUps) {
      const { matchUpId, roundNumber, sides } = inContextMatchUp;
      const matchUp = getRawMatchUp(matchUpId);
      delete matchUp.extensions;
      delete matchUp.notes;

      if (matchUp.matchUpStatus !== BYE) {
        Object.assign(matchUp, toBePlayed);
      }

      if (roundNumber && roundNumber > 1 && matchUp.drawPositions) {
        const fedDrawPositions = sides
          ?.map(
            ({ drawPosition, participantFed }) =>
              !participantFed && drawPosition
          )
          .filter(Boolean);
        matchUp.drawPositions = matchUp.drawPositions.map((drawPosition) =>
          !fedDrawPositions.includes(drawPosition) ? drawPosition : undefined
        );
      }

      if (removeScheduling) {
        delete matchUp.timeItems;
      } else if (matchUp.timeItems?.length) {
        matchUp.timeItems = matchUp.timeItems.filter(
          (timeItem) =>
            ![
              ASSIGN_COURT,
              ASSIGN_VENUE,
              ASSIGN_OFFICIAL,
              SCHEDULED_DATE,
              SCHEDULED_TIME,
            ].includes(timeItem.itemType)
        );
      }

      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        drawDefinition,
        matchUp,
      });
    }
  }

  const structureIds = (drawDefinition.structures || []).map(
    ({ structureId }) => structureId
  );

  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
