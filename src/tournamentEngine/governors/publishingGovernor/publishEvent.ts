import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';
import { getEventData } from './getEventData';
import { unique } from '../../../utilities';

import { PUBLISH, PUBLIC, STATUS } from '../../../constants/timeItemConstants';
import { Event, Tournament } from '../../../types/tournamentFromSchema';
import { PUBLISH_EVENT } from '../../../constants/topicConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export type PublishingDetail = {
  roundLimit?: number; // only applicable to structureDetails
  published?: boolean;
  embargo?: string;
};

export type DrawPublishingDetails = {
  structureDetails?: { [key: string]: PublishingDetail }; // if no keys, all published
  stages?: { [key: string]: PublishingDetail }; // if no keys, all published; stage embargo supercedes structure embargo
  publishingDetail: PublishingDetail; // draw embargo supercedes structure/stage embargo
  structureIdsToRemove?: string[];
  structureIdsToAdd?: string[];
  stagesToRemove?: string[];
  stagesToAdd?: string[];
};

type PublishEventType = {
  includePositionAssignments?: boolean;
  policyDefinitions?: PolicyDefinitions;
  removePriorValues?: boolean;
  tournamentRecord: Tournament;
  drawIds?: string[];
  status?: string;
  event?: Event;

  drawDetails?: { [key: string]: DrawPublishingDetails }; // if no keys, all published

  drawIdsToRemove?: string[];
  drawIdsToAdd?: string[];
};

export function publishEvent(params: PublishEventType) {
  let { drawIds } = params;
  const {
    includePositionAssignments,
    removePriorValues,
    tournamentRecord,
    status = PUBLIC,
    event,

    drawIdsToRemove,
    drawIdsToAdd,
  } = params;

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  // publishing will draw on scoring policy, round naming policy and participant (privacy) policy
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord, event });
  const policyDefinitions = {
    ...appliedPolicies,
    ...params.policyDefinitions,
  };

  const itemType = `${PUBLISH}.${STATUS}`;
  const eventDrawIds = event.drawDefinitions?.map(({ drawId }) => drawId) ?? [];

  const pubState = getEventTimeItem({
    itemType,
    event,
  })?.timeItem?.itemValue?.[status];

  if (!drawIds && !drawIdsToAdd && !drawIdsToRemove && !params.drawDetails) {
    // by default publish all drawIds in an event
    drawIds = eventDrawIds;
  } else if (!drawIds && (drawIdsToAdd?.length || drawIdsToRemove?.length)) {
    drawIds = pubState?.drawIds ?? [];
  }

  drawIds = (drawIds ?? []).filter(
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

  const drawDetails = {};
  for (const drawId of drawIds ?? []) {
    drawDetails[drawId] = params.drawDetails?.[drawId] ?? { published: true };
  }

  /*
  if (
    !structureIds &&
    (structureIdsToAdd?.length || structureIdsToRemove?.length)
  ) {
    structureIds = timeItem?.itemValue?.PUBLIC?.structureIds || [];
  }

  structureIds = (structureIds ?? []).filter(
    (structureId) =>
      !structureIdsToRemove?.length ||
      !structureIdsToRemove.includes(structureId)
  );

  if (structureIdsToAdd?.length) {
    structureIds = unique(structureIds.concat(...structureIdsToAdd));
  }

  if (!stages && (stagesToAdd?.length || stagesToRemove?.length)) {
    stages = timeItem?.itemValue?.PUBLIC?.stages || [];
  }

  stages = (stages ?? []).filter(
    (stage) => !stagesToRemove?.length || !stagesToRemove.includes(stage)
  );

  if (stagesToAdd?.length) {
    stages = unique(stages.concat(...stagesToAdd));
  }
  */

  const updatedTimeItem = {
    itemValue: {
      [status]: { ...pubState, drawIds },
    },
    itemType,
  };
  addEventTimeItem({ event, timeItem: updatedTimeItem, removePriorValues });

  const { eventData } = getEventData({
    includePositionAssignments,
    usePublishState: true,
    tournamentRecord,
    policyDefinitions,
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
