import { addNotice } from '../../global/globalState';
import {
  ADD_DRAW_DEFINITION,
  ADD_MATCHUPS,
  DELETED_DRAW_IDS,
  DELETED_MATCHUP_IDS,
  MODIFY_DRAW_DEFINITION,
  MODIFY_MATCHUP,
} from '../../constants/topicConstants';

function drawUpdatedAt(drawDefinition) {
  if (!drawDefinition) return;
  let updatedAt = Date.now();
  if (updatedAt === drawDefinition.updatedAt) {
    updatedAt += 1;
  }
  drawDefinition.updatedAt = updatedAt;
}
export function addMatchUpsNotice({ drawDefinition, matchUps }) {
  drawUpdatedAt(drawDefinition);
  addNotice({ topic: ADD_MATCHUPS, payload: { matchUps } });
}
export function deleteMatchUpsNotice({ drawDefinition, matchUpIds, action }) {
  drawUpdatedAt(drawDefinition);
  addNotice({
    topic: DELETED_MATCHUP_IDS,
    payload: {
      action,
      matchUpIds,
    },
  });
}
export function modifyMatchUpNotice({ drawDefinition, matchUp }) {
  modifyDrawNotice({ drawDefinition });
  addNotice({
    topic: MODIFY_MATCHUP,
    payload: { matchUp },
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
export function modifyDrawNotice({ drawDefinition }) {
  drawUpdatedAt(drawDefinition);
  addNotice({
    topic: MODIFY_DRAW_DEFINITION,
    payload: { drawDefinition },
    key: drawDefinition.drawId,
  });
}
