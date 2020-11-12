import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_MATCHUP_FORMAT,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setEventDefaultMatchUpFormat({
  tournamentRecord,
  event,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!event) return { error: MISSING_EVENT };
  return { error: 'not implemented' };
}

export function setDrawDefaultMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  drawEngine,
  event,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };

  const result = drawEngine
    .setState(drawDefinition)
    .setMatchUpFormat({ matchUpFormat });

  if (result.success) {
    const { drawId } = drawDefinition;
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });

    return SUCCESS;
  }
  return result;
}

export function setStructureDefaultMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
  structureId,
  drawEngine,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const result = drawEngine
    .setState(drawDefinition)
    .setMatchUpFormat({ matchUpFormat, structureId });

  if (result.success) {
    const { drawId } = drawDefinition;
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });

    return SUCCESS;
  }

  return result;
}

export function setCollectionDefaultMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  return { error: 'not implemented' };
}
