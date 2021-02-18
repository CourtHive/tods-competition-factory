import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { getTimeItem } from '../../queryGovernor/timeItems';
import { addNotice } from '../../../../global/globalState';
import { findEvent } from '../../../getters/eventGetter';
import {
  addEventTimeItem,
  addTournamentTimeItem,
} from '../../tournamentGovernor/addTimeItem';

import { SUCCESS } from '../../../../constants/resultConstants';
import { DRAW_DEFINITION_NOT_FOUND } from '../../../../constants/errorConditionConstants';
import {
  HIDDEN,
  PUBLIC,
  PUBLISH,
  STATUS,
} from '../../../../constants/timeItemConstants';

export function deleteDrawDefinitions({ tournamentRecord, eventId, drawIds }) {
  const drawId = Array.isArray(drawIds) && drawIds[0];
  const { event } = findEvent({ tournamentRecord, eventId, drawId });
  const auditTrail = [];
  const matchUpIds = [];
  const deletedDrawDetails = [];

  if (event) {
    if (!event.drawDefinitions) {
      return { error: DRAW_DEFINITION_NOT_FOUND };
    }

    event.drawDefinitions = event.drawDefinitions.filter((drawDefinition) => {
      if (drawIds.includes(drawDefinition.drawId)) {
        const auditData = {
          action: 'deleteDrawDefinition',
          payload: { drawDefinition },
        };
        auditTrail.push(auditData);
        const { drawId, drawType, drawName } = drawDefinition;
        deletedDrawDetails.push({ drawId, drawType, drawName });
        const { matchUps } = allDrawMatchUps({ event, drawDefinition });
        matchUps.forEach(({ matchUpId }) => matchUpIds.push(matchUpId));
      }
      return !drawIds.includes(drawDefinition.drawId);
    });

    const itemType = `${PUBLISH}.${STATUS}`;
    const publishStatus = getTimeItem({ event, itemType });
    const drawPublished =
      publishStatus &&
      (!publishStatus.drawIds?.length ||
        publishStatus.drawIds.includes(drawId)) &&
      publishStatus !== HIDDEN;
    if (drawPublished) {
      const updatedDrawIds =
        publishStatus.drawIds?.filter(
          (publishedDrawId) => publishedDrawId !== drawId
        ) || [];
      const timeItem = {
        itemType: `${PUBLISH}.${STATUS}`,
        itemValue: {
          [PUBLIC]: {
            drawIds: updatedDrawIds,
          },
        },
      };
      const result = addEventTimeItem({ event, timeItem });
      if (result.error) return { error: result.error };
    }
  }

  if (auditTrail.length) {
    addNotice({ topic: 'audit', payload: auditTrail });
    const timeItem = {
      itemType: 'deleteDrawDefinitions',
      itemValue: deletedDrawDetails,
    };
    addTournamentTimeItem({ tournamentRecord, timeItem });
  }
  if (matchUpIds.length)
    addNotice({ topic: 'deletedMatchUpIds', payload: { matchUpIds } });
  return SUCCESS;
}
