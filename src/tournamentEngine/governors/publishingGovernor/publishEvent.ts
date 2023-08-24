import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';
import { getEventData } from './getEventData';
import { unique } from '../../../utilities';

import { PUBLISH, PUBLIC, STATUS } from '../../../constants/timeItemConstants';
import { PUBLISH_EVENT } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function publishEvent(params) {
  let { policyDefinitions, drawIds, structureIds } = params;
  const {
    removePriorValues,
    tournamentRecord,
    status = PUBLIC,
    event,

    drawIdsToRemove,
    drawIdsToAdd,

    includePositionAssignments,
    structureIdsToRemove,
    structureIdsToAdd,
  } = params;

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  if (!policyDefinitions) {
    const { appliedPolicies } = getAppliedPolicies({ tournamentRecord, event });
    policyDefinitions = appliedPolicies;
  }

  const itemType = `${PUBLISH}.${STATUS}`;
  const eventDrawIds = event.drawDefinitions?.map(({ drawId }) => drawId) || [];

  const { timeItem } = getEventTimeItem({
    itemType,
    event,
  });

  if (!drawIds && !drawIdsToAdd && !drawIdsToRemove) {
    // by default publish all drawIds in an event
    drawIds = eventDrawIds;
  } else if (!drawIds && (drawIdsToAdd?.length || drawIdsToRemove?.length)) {
    drawIds = timeItem?.itemValue?.PUBLIC?.drawIds || [];
  }

  drawIds = (drawIds || []).filter(
    (drawId) => !drawIdsToRemove?.length || !drawIdsToRemove.includes(drawId)
  );

  if (drawIdsToAdd?.length) {
    drawIds = unique(
      drawIds.concat(
        // ensure that only drawIds which are part of event are included
        ...drawIdsToAdd.filter((drawId) => eventDrawIds.includes(drawId))
      )
    );
  }

  if (
    !structureIds &&
    (structureIdsToAdd?.length || structureIdsToRemove?.length)
  ) {
    structureIds = timeItem?.itemValue?.PUBLIC?.drawIds || [];
  }

  structureIds = (structureIds || []).filter(
    (structureId) =>
      !structureIdsToRemove?.length ||
      !structureIdsToRemove.includes(structureId)
  );

  if (structureIdsToAdd?.length) {
    structureIds = unique(structureIds.push(...structureIdsToAdd));
  }

  const updatedTimeItem = {
    itemValue: { [status]: { drawIds, structureIds } },
    itemType,
  };
  addEventTimeItem({ event, timeItem: updatedTimeItem, removePriorValues });

  const { eventData } = getEventData({
    includePositionAssignments,
    usePublishState: true,
    policyDefinitions,
    tournamentRecord,
    event,
  });

  // filter out drawData for unPublished draws
  const publishState = eventData?.eventInfo?.publish?.state;
  eventData.drawsData = eventData.drawsData.filter(
    ({ drawId }) => publishState?.PUBLIC?.drawIds.includes(drawId)
  );

  addNotice({
    payload: { eventData, tournamentId: tournamentRecord.tournamentId },
    topic: PUBLISH_EVENT,
  });

  return { ...SUCCESS, eventData };
}
