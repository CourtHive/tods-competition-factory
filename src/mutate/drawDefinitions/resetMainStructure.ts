import { deleteMatchUpsNotice, modifyDrawNotice } from '../notifications/drawNotifications';

import { SUCCESS } from '@Constants/resultConstants';
import { MISSING_DRAW_DEFINITION, STRUCTURE_NOT_FOUND } from '@Constants/errorConditionConstants';
import { MAIN } from '@Constants/drawDefinitionConstants';

export function resetMainStructure({ tournamentRecord, drawDefinition, resetEntries, event }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const structure = drawDefinition.structures?.find((structure) => structure.stage === MAIN);

  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const removedMatchUpIds = structure.matchUps?.map(({ matchUpId }) => matchUpId) || [];

  structure.positionAssignments = [];
  structure.seedAssignments = [];
  structure.matchUps = [];

  deleteMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    action: 'resetMainStructure',
    matchUpIds: removedMatchUpIds,
    drawDefinition,
  });

  if (resetEntries) {
    drawDefinition.entries = drawDefinition.entries.filter((entry) => entry.entryStage !== MAIN);
  }

  modifyDrawNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    drawDefinition,
    structureIds: [structure.structureId],
  });

  return { ...SUCCESS };
}
