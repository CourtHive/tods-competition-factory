import { addNotice, deleteNotice } from '../../global/state/globalState';

import {
  ADD_DRAW_DEFINITION,
  ADD_MATCHUPS,
  DELETED_DRAW_IDS,
  DELETED_MATCHUP_IDS,
  MODIFY_DRAW_DEFINITION,
  MODIFY_MATCHUP,
  MODIFY_POSITION_ASSIGNMENTS,
  MODIFY_SEED_ASSIGNMENTS,
} from '../../constants/topicConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../constants/errorConditionConstants';

function drawUpdatedAt(drawDefinition, structureIds) {
  if (!drawDefinition) return;

  let timeStamp = Date.now();
  if (timeStamp === new Date(drawDefinition.updatedAt).getTime())
    timeStamp += 1;
  const updatedAt = new Date(timeStamp).toISOString();

  const relevantStructureIds = structureIds?.filter(Boolean);

  drawDefinition.updatedAt = updatedAt;
  drawDefinition.structures?.filter(Boolean).forEach((structure) => {
    if (
      !relevantStructureIds?.length ||
      relevantStructureIds?.includes(structure.structureId)
    ) {
      structure.updatedAt = updatedAt;
    }
  });
}
export function addMatchUpsNotice({
  drawDefinition,
  tournamentId,
  matchUps,
  eventId,
}) {
  if (drawDefinition) drawUpdatedAt(drawDefinition);
  addNotice({
    payload: { matchUps, tournamentId, eventId },
    topic: ADD_MATCHUPS,
  });
}
export function deleteMatchUpsNotice({
  drawDefinition,
  tournamentId,
  matchUpIds,
  eventId,
  action,
}) {
  if (drawDefinition) drawUpdatedAt(drawDefinition);
  addNotice({
    topic: DELETED_MATCHUP_IDS,
    payload: {
      tournamentId,
      matchUpIds,
      eventId,
      action,
    },
  });
  for (const matchUpId of matchUpIds) {
    deleteNotice({ key: matchUpId });
  }
}
export function modifyMatchUpNotice({
  drawDefinition,
  tournamentId,
  structureId,
  context,
  eventId,
  matchUp,
}) {
  if (!matchUp) {
    console.log(MISSING_MATCHUP);
    return { error: MISSING_MATCHUP };
  }
  if (drawDefinition)
    modifyDrawNotice({
      structureIds: [structureId],
      drawDefinition,
      tournamentId,
      eventId,
    });
  addNotice({
    topic: MODIFY_MATCHUP,
    payload: { matchUp, tournamentId, context },
    key: matchUp.matchUpId,
  });
}

export function addDrawNotice({ tournamentId, eventId, drawDefinition }) {
  if (!drawDefinition) {
    console.log(MISSING_DRAW_DEFINITION);
    return { error: MISSING_DRAW_DEFINITION };
  }
  drawUpdatedAt(drawDefinition);
  addNotice({
    payload: { drawDefinition, tournamentId, eventId },
    topic: ADD_DRAW_DEFINITION,
    key: drawDefinition.drawId,
  });
}

export function deleteDrawNotice({ tournamentId, eventId, drawId }) {
  addNotice({
    payload: { drawId, tournamentId, eventId },
    topic: DELETED_DRAW_IDS,
    key: drawId,
  });
  deleteNotice({ key: drawId });
}
export function modifyDrawNotice({
  drawDefinition,
  tournamentId,
  structureIds,
  eventId,
}) {
  if (!drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }
  drawUpdatedAt(drawDefinition, structureIds);
  addNotice({
    payload: { tournamentId, eventId, drawDefinition },
    topic: MODIFY_DRAW_DEFINITION,
    key: drawDefinition.drawId,
  });
}

export function modifySeedAssignmentsNotice({
  drawDefinition,
  tournamentId,
  structure,
  eventId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure) return { error: MISSING_STRUCTURE };

  const seedAssignments = structure.seedAssignments;
  const structureId = structure.structureId;
  const drawId = drawDefinition.drawId;

  addNotice({
    payload: { tournamentId, eventId, drawId, structureId, seedAssignments },
    topic: MODIFY_SEED_ASSIGNMENTS,
    key: drawDefinition.drawId,
  });
  modifyDrawNotice({
    sructureIds: [structureId],
    drawDefinition,
    tournamentId,
    eventId,
  });
}

export function modifyPositionAssignmentsNotice({
  drawDefinition,
  tournamentId,
  structure,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure) return { error: MISSING_STRUCTURE };

  const positionAssignments = structure.positionAssignments;
  const structureId = structure.structureId;
  const drawId = drawDefinition.drawId;
  const eventId = event?.eventId;

  addNotice({
    topic: MODIFY_POSITION_ASSIGNMENTS,
    payload: {
      positionAssignments,
      tournamentId,
      structureId,
      eventId,
      drawId,
    },
    key: drawDefinition.drawId,
  });
  modifyDrawNotice({
    sructureIds: [structureId],
    drawDefinition,
    tournamentId,
    eventId,
  });
}
