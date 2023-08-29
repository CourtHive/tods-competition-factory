import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { VOLUNTARY_CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

export function resetVoluntaryConsolationStructure({
  tournamentRecord,
  drawDefinition,
  resetEntries,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const structure = drawDefinition.structures?.find(
    (structure) => structure.stage === VOLUNTARY_CONSOLATION
  );

  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const removedMatchUpIds =
    structure.matchUps?.map(({ matchUpId }) => matchUpId) || [];

  structure.positionAssignments = [];
  structure.seedAssignments = [];
  structure.matchUps = [];

  deleteMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    action: 'resetVoluntaryConsolationStructure',
    matchUpIds: removedMatchUpIds,
    drawDefinition,
  });

  // TODO: add modifyPositionAssignmentsNotice, modifySeedAssignmentsNotice

  if (resetEntries) {
    drawDefinition.entries = drawDefinition.entries.filter(
      (entry) => entry.entryStage !== VOLUNTARY_CONSOLATION
    );
  }

  modifyDrawNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    drawDefinition,
    structureIds: [structure.structureId],
  });

  return { ...SUCCESS };
}
