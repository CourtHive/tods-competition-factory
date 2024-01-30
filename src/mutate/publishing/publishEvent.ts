import { getAppliedPolicies } from '../../query/extensions/getAppliedPolicies';
import { getEventPublishStatus } from '../../query/event/getEventPublishStatus';
import { modifyEventPublishStatus } from '../events/modifyEventPublishStatus';
import { decorateResult } from '../../functions/global/decorateResult';
import { getEventData } from '../../query/event/getEventData';
import { addNotice } from '../../global/state/globalState';

import { Event, Tournament } from '../../types/tournamentTypes';
import { PUBLISH_EVENT } from '@Constants/topicConstants';
import { PolicyDefinitions } from '../../types/factoryTypes';
import { PUBLIC } from '@Constants/timeItemConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  STRUCTURE_NOT_FOUND,
} from '@Constants/errorConditionConstants';

export type PublishingDetail = {
  roundLimit?: number; // only applicable to structureDetails
  published?: boolean;
  embargo?: string;
};

export type DrawPublishingDetails = {
  structureDetails?: { [key: string]: PublishingDetail }; // if no keys, all published
  stageDetails?: { [key: string]: PublishingDetail }; // if no keys, all published; stage embargo supercedes structure embargo
  publishingDetail: PublishingDetail; // draw embargo supercedes structure/stage embargo
  structureIdsToRemove?: string[];
  structureIdsToAdd?: string[];
  stagesToRemove?: string[];
  stagesToAdd?: string[];
};

type PublishEventType = {
  includePositionAssignments?: boolean; // include positionAssignments in eventData
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

  const eventDrawIds = event.drawDefinitions?.map(({ drawId }) => drawId) ?? [];

  const keyedDrawIds = params.drawDetails ? Object.keys(params.drawDetails) : [];
  const specifiedDrawIds = keyedDrawIds.length ? [] : params.drawIds;

  const drawIdsToValidate = (drawIdsToAdd ?? []).concat(
    ...(drawIdsToRemove ?? []),
    ...(specifiedDrawIds ?? []),
    ...keyedDrawIds,
  );
  const invalidDrawIds = drawIdsToValidate.filter((drawId) => !eventDrawIds.includes(drawId));
  if (invalidDrawIds.length) {
    return decorateResult({
      result: { error: DRAW_DEFINITION_NOT_FOUND },
      context: { invalidDrawIds },
    });
  }

  const pubStatus = getEventPublishStatus({ event, status });

  // filter out any drawIds that do not have corresponding drawDefinitions not in the event
  const drawDetails = Object.keys(pubStatus?.drawDetails || {})
    .filter((drawId) => eventDrawIds.includes(drawId))
    .reduce((details: any, drawId) => {
      details[drawId] = pubStatus.drawDetails[drawId];
      return details;
    }, {});

  for (const drawId of eventDrawIds) {
    if (!drawIdsToValidate.length || drawIdsToValidate.includes(drawId)) {
      if (drawIdsToRemove?.includes(drawId) || (specifiedDrawIds?.length && !specifiedDrawIds.includes(drawId))) {
        drawDetails[drawId] = {
          ...drawDetails[drawId],
          publishingDetail: { published: false },
        };
      } else if (drawIdsToAdd?.includes(drawId) || specifiedDrawIds?.includes(drawId) || !specifiedDrawIds?.length) {
        drawDetails[drawId] = {
          ...drawDetails[drawId],
          publishingDetail: { published: true },
        };
      }
    }

    if (params.drawDetails?.[drawId]) {
      const newDetail = params.drawDetails[drawId];
      let structureDetails = newDetail.structureDetails ?? drawDetails[drawId].structureDetails;
      const stageDetails = newDetail.stageDetails ?? drawDetails[drawId].stageDetails ?? {};

      const {
        structureIdsToRemove = [],
        structureIdsToAdd = [],
        publishingDetail = {},
        stagesToRemove = [],
        stagesToAdd = [],
      } = newDetail;

      if (structureIdsToAdd || stagesToAdd) publishingDetail.published = true;

      drawDetails[drawId] = {
        publishingDetail,
        structureDetails,
        stageDetails,
      };

      if (structureIdsToAdd.length || structureIdsToRemove.length) {
        const drawStructureIds = (
          event.drawDefinitions?.find((drawDefinition) => drawDefinition.drawId === drawId)?.structures ?? []
        ).map(({ structureId }) => structureId);
        const structureIdsToValidate = (structureIdsToAdd ?? []).concat(structureIdsToRemove ?? []);
        const invalidStructureIds = structureIdsToValidate.filter(
          (structureId) => !drawStructureIds.includes(structureId),
        );
        if (invalidStructureIds.length) {
          return decorateResult({
            result: { error: STRUCTURE_NOT_FOUND },
            context: { invalidStructureIds },
          });
        }

        structureDetails = structureDetails ?? {};
        for (const structureId of drawStructureIds) {
          if (structureIdsToRemove.includes(structureId)) {
            structureDetails[structureId] = { published: false };
          } else {
            structureDetails[structureId] = { published: true };
          }
        }

        drawDetails[drawId].structureDetails = structureDetails;
      }

      const drawStages = (
        event.drawDefinitions?.find((drawDefinition) => drawDefinition.drawId === drawId)?.structures ?? []
      ).map(({ stage }) => stage as string);

      if (stagesToAdd.length) {
        for (const stage of stagesToAdd) {
          stageDetails[stage] = { published: true };
        }

        for (const stage of drawStages) {
          if (!stageDetails[stage]) {
            stageDetails[stage] = { published: false };
          }
        }
      }
      if (stagesToAdd.length || stagesToRemove.length) {
        for (const stage of stagesToRemove) {
          stageDetails[stage] = { published: false };
        }

        for (const stage of drawStages) {
          if (!stageDetails[stage]) {
            stageDetails[stage] = { published: true };
          }
        }
      }

      if (stagesToAdd.length || stagesToRemove.length) {
        drawDetails[drawId].stageDetails = stageDetails;
      }
    }
  }

  modifyEventPublishStatus({
    statusObject: { drawDetails },
    removePriorValues,
    status,
    event,
  });

  const { eventData } = getEventData({
    includePositionAssignments,
    usePublishState: true,
    tournamentRecord,
    policyDefinitions,
    event,
  });

  addNotice({
    payload: { eventData, tournamentId: tournamentRecord.tournamentId },
    topic: PUBLISH_EVENT,
  });

  return { ...SUCCESS, eventData };
}
