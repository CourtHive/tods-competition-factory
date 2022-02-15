import { addNotice } from '../../global/state/globalState';
import {
  ADD_DRAW_DEFINITION,
  ADD_MATCHUPS,
  DELETED_DRAW_IDS,
  DELETED_MATCHUP_IDS,
  MODIFY_DRAW_DEFINITION,
  MODIFY_MATCHUP,
} from '../../constants/topicConstants';

function drawUpdatedAt(drawDefinition, structureIds) {
  if (!drawDefinition) return;
  let updatedAt = Date.now();
  if (updatedAt === drawDefinition.updatedAt) {
    updatedAt += 1;
  }

  const relevantStructureIds = structureIds?.filter(Boolean);

  drawDefinition.updatedAt = updatedAt;
  drawDefinition.structures?.forEach((structure) => {
    if (
      !relevantStructureIds?.length ||
      relevantStructureIds?.includes(structure.structureId)
    ) {
      structure.updatedAt = updatedAt;
    }
  });
}
export function addMatchUpsNotice({ drawDefinition, matchUps, tournamentId }) {
  drawUpdatedAt(drawDefinition);
  addNotice({ topic: ADD_MATCHUPS, payload: { matchUps, tournamentId } });
}
export function deleteMatchUpsNotice({
  drawDefinition,
  tournamentId,
  matchUpIds,
  action,
}) {
  drawUpdatedAt(drawDefinition);
  addNotice({
    topic: DELETED_MATCHUP_IDS,
    payload: {
      tournamentId,
      matchUpIds,
      action,
    },
  });
}
export function modifyMatchUpNotice({ drawDefinition, matchUp, tournamentId }) {
  const structureId = matchUp.structureId;
  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });
  addNotice({
    topic: MODIFY_MATCHUP,
    payload: { matchUp, tournamentId },
    key: matchUp.matchUpId,
  });
}

export function addDrawNotice({ drawDefinition }) {
  drawUpdatedAt(drawDefinition);
  addNotice({
    topic: ADD_DRAW_DEFINITION,
    payload: { drawDefinition },
    key: drawDefinition.drawId,
  });
}

export function deleteDrawNotice({ drawId }) {
  addNotice({
    topic: DELETED_DRAW_IDS,
    payload: { drawId },
  });
}
export function modifyDrawNotice({ drawDefinition, structureIds }) {
  drawUpdatedAt(drawDefinition, structureIds);
  addNotice({
    topic: MODIFY_DRAW_DEFINITION,
    payload: { drawDefinition },
    key: drawDefinition.drawId,
  });
}
