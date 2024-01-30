import { deleteDrawNotice, deleteMatchUpsNotice } from '../notifications/drawNotifications';
import { getPositionAssignments } from '@Query/structure/getPositionAssignments';
import { checkAndUpdateSchedulingProfile } from '../tournaments/schedulingProfile';
import { getEventPublishStatus } from '@Query/event/getEventPublishStatus';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { allDrawMatchUps } from '@Query/matchUps/getAllDrawMatchUps';
import { decorateResult } from '@Functions/global/decorateResult';
import { modifyEventPublishStatus } from './modifyEventPublishStatus';
import { addEventExtension } from '../extensions/addRemoveExtensions';
import { getFlightProfile } from '@Query/event/getFlightProfile';
import { definedAttributes } from '@Tools/definedAttributes';
import { getDrawStructures } from '../../acquire/findStructure';
import { addNotice } from '@Global/state/globalState';
import { publishEvent } from '../publishing/publishEvent';
import { addExtension } from '../extensions/addExtension';
import { findExtension } from '../../acquire/findExtension';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { findEvent } from '../../acquire/findEvent';

import { MISSING_TOURNAMENT_RECORD, SCORES_PRESENT } from '@Constants/errorConditionConstants';
import { DRAW_DELETIONS, FLIGHT_PROFILE } from '@Constants/extensionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '@Constants/entryStatusConstants';
import { MAIN, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { DELETE_DRAW_DEFINITIONS } from '@Constants/auditConstants';
import { POLICY_TYPE_SCORING } from '@Constants/policyConstants';
import { Event, Tournament } from '@Types/tournamentTypes';
import { PolicyDefinitions } from '@Types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { AUDIT } from '@Constants/topicConstants';

type DeleteDrawDefinitionArgs = {
  policyDefinitions?: PolicyDefinitions;
  tournamentRecord: Tournament;
  autoPublish?: boolean;
  drawIds?: string[];
  auditData?: any;
  eventId?: string;
  force?: boolean;
  event?: Event;
};
export function deleteDrawDefinitions(params: DeleteDrawDefinitionArgs) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const stack = 'deleteDrawDefinitions';

  let drawIds = params.drawIds ?? [];
  let event = params.event;
  const { autoPublish = true, tournamentRecord, auditData, eventId, force } = params;

  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord, event });
  const policyDefinitions = { ...appliedPolicies, ...params.policyDefinitions };

  const drawId = Array.isArray(drawIds) ? drawIds[0] : undefined;

  if (!event) {
    const result = findEvent({ tournamentRecord, eventId, drawId });
    if (result.error) return result;
    event = result.event;
  }

  const deletedDrawsDetail: any[] = [];
  const matchUpIds: string[] = [];
  const auditTrail: any[] = [];

  if (!event?.drawDefinitions)
    return decorateResult({
      info: 'event has no drawDefinition',
      result: { ...SUCCESS },
      stack,
    });

  const eventDrawIds = event.drawDefinitions.map(({ drawId }) => drawId);
  // if drawIds were not provided, assume that the intent is to delete all drawDefinitions
  if (!drawIds.length) drawIds = eventDrawIds;

  drawIds = drawIds.filter((drawId) => eventDrawIds.includes(drawId));

  if (!drawIds.length)
    return decorateResult({
      info: 'nothing to do; no matching drawIds in event.',
      result: { ...SUCCESS },
      stack,
    });

  const flightProfile = makeDeepCopy(getFlightProfile({ event }).flightProfile, false, true);

  const positionAssignmentMap = ({ participantId, drawPosition, qualifier, bye }) => ({
    bye,
    qualifier,
    drawPosition,
    participantId,
  });

  const allowDeletionWithScoresPresent =
    force ?? appliedPolicies?.[POLICY_TYPE_SCORING]?.allowDeletionWithScoresPresent?.drawDefinitions;

  const publishStatus = getEventPublishStatus({ event }) ?? {};

  let updatedDrawIds =
    publishStatus.drawIds ?? (publishStatus.drawDetails && Object.keys(publishStatus.drawDetails)) ?? [];
  let publishedDrawsDeleted;

  const drawIdsWithScoresPresent: string[] = [];
  const filteredDrawDefinitions = event.drawDefinitions.filter((drawDefinition) => {
    if (drawIds.includes(drawDefinition.drawId)) {
      const matchUps = allDrawMatchUps({ event, drawDefinition })?.matchUps ?? [];

      const scoresPresent = matchUps.some(({ score }) => checkScoreHasValue({ score }));
      if (scoresPresent && !allowDeletionWithScoresPresent) {
        drawIdsWithScoresPresent.push(drawDefinition.drawId);
        return true;
      }

      const { drawId, drawType, drawName } = drawDefinition;
      const flight = flightProfile?.flights?.find((flight) => flight.drawId === drawDefinition.drawId);

      if (flight) {
        flight.drawEntries = flight.drawEntries?.filter((entry) =>
          STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus),
        );
      }

      if (updatedDrawIds.includes(drawId)) {
        updatedDrawIds = updatedDrawIds.filter((id) => id !== drawId);
        publishedDrawsDeleted = true;
      }

      const mainStructure = getDrawStructures({
        stageSequence: 1,
        drawDefinition,
        stage: MAIN,
      })?.structures?.[0];

      const pa: any = mainStructure
        ? getPositionAssignments({
            structureId: mainStructure.structureId,
            tournamentRecord,
            drawDefinition,
          })
        : undefined;

      const positionAssignments = pa?.positionAssignments?.map(positionAssignmentMap);

      const qualifyingStructures = getDrawStructures({
        stage: QUALIFYING,
        drawDefinition,
      })?.structures;

      const qualifyingPositionAssignments = qualifyingStructures?.length
        ? qualifyingStructures.map((qualifyingStructure) => {
            const stageSequence = qualifyingStructure.stageSequence;
            const pa: any = getPositionAssignments({
              structureId: qualifyingStructure.structureId,
              tournamentRecord,
              drawDefinition,
            });
            const positionAssignments = pa?.positionAssignments.map(positionAssignmentMap);
            return { positionAssignments, stageSequence };
          })
        : undefined;

      // TODO: conditionally add auditTrail based on policyDefinitions
      const audit = {
        action: DELETE_DRAW_DEFINITIONS,
        payload: {
          drawDefinitions: [drawDefinition],
          eventId: eventId ?? event?.eventId,
          auditData,
        },
      };
      auditTrail.push(audit);

      deletedDrawsDetail.push(
        definedAttributes({
          tournamentId: tournamentRecord.tournamentId,
          eventId: eventId ?? event?.eventId,
          qualifyingPositionAssignments,
          positionAssignments,
          auditData,
          drawType,
          drawName,
          drawId,
        }),
      );
      matchUps?.forEach(({ matchUpId }) => matchUpIds.push(matchUpId));
    }
    return !drawIds.includes(drawDefinition.drawId);
  });

  if (drawIdsWithScoresPresent.length && !force) {
    return decorateResult({
      context: { drawIdsWithScoresPresent },
      result: { error: SCORES_PRESENT },
      stack,
    });
  }

  event.drawDefinitions = filteredDrawDefinitions;

  if (flightProfile) {
    const extension = {
      name: FLIGHT_PROFILE,
      value: flightProfile,
    };

    addEventExtension({ event, extension });
  }

  // cleanup references to drawId in schedulingProfile extension
  checkAndUpdateSchedulingProfile({ tournamentRecord });

  if (publishedDrawsDeleted) {
    const drawDetails = {};
    for (const drawId of updatedDrawIds) {
      drawDetails[drawId] = publishStatus.drawDetails?.[drawId] ?? {
        published: true,
      };
    }
    const result = modifyEventPublishStatus({
      statusObject: { drawDetails },
      event,
    });
    if (result.error) return { error: result.error };
  }

  if (auditTrail.length) {
    addNotice({ topic: AUDIT, payload: auditTrail });
  }
  if (matchUpIds.length) {
    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds,
    });
  }

  drawIds.forEach((drawId) => {
    deleteDrawNotice({ drawId });
  });

  addDrawDeletionTelemetry({ event, deletedDrawsDetail, auditData });

  if (autoPublish && publishedDrawsDeleted) {
    const result = publishEvent({
      drawIdsToRemove: drawIds,
      policyDefinitions,
      tournamentRecord,
      event,
    });
    if (result.error) return { ...SUCCESS, info: result.error };
  }

  return { ...SUCCESS };
}

function addDrawDeletionTelemetry({ event, deletedDrawsDetail, auditData }) {
  const { extension } = findExtension({
    name: DRAW_DELETIONS,
    element: event,
  });

  const deletionData = { ...auditData, deletedDrawsDetail };
  const updatedExtension = {
    name: DRAW_DELETIONS,
    value: Array.isArray(extension?.value) ? extension?.value.concat(deletionData) : [deletionData],
  };
  addExtension({ element: event, extension: updatedExtension });
}
