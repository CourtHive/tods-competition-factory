import { deleteMatchUpsNotice, modifyDrawNotice } from '@Mutate/notifications/drawNotifications';

// Constants
import { MISSING_DRAW_DEFINITION, SCORES_PRESENT, STRUCTURE_NOT_FOUND } from '@Constants/errorConditionConstants';
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { QUALIFYING } from '@Constants/drawDefinitionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { completedMatchUpStatuses } from '@Constants/matchUpStatusConstants';

interface ResetQualifyingStructureArgs {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  event?: Event;
  structureId: string;
}

export function resetQualifyingStructure({
  tournamentRecord,
  drawDefinition,
  event,
  structureId,
}: ResetQualifyingStructureArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const structure = drawDefinition.structures?.find(
    (structure) => structure.stage === QUALIFYING && structure.structureId === structureId,
  );

  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const completedMatchUps = structure.matchUps?.filter((matchUp) =>
    completedMatchUpStatuses.includes(matchUp.matchUpStatus),
  );

  if (completedMatchUps?.length) return { error: SCORES_PRESENT };

  const removedMatchUpIds = structure.matchUps?.map(({ matchUpId }) => matchUpId) || [];

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

  modifyDrawNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    drawDefinition,
    structureIds: [structure.structureId],
  });

  return { ...SUCCESS };
}
