import { getEventPublishStatus } from '../../query/event/getEventPublishStatus';
import { modifyEventPublishStatus } from '../events/modifyEventPublishStatus';
import { definedAttributes } from '../../tools/definedAttributes';
import { addNotice } from '../../global/state/globalState';

import { MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { PUBLISH_EVENT_SEEDING, UNPUBLISH_EVENT_SEEDING } from '@Constants/topicConstants';
import { PUBLIC } from '@Constants/timeItemConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function publishEventSeeding({
  removePriorValues = true,
  stageSeedingScaleNames,
  seedingScaleNames,
  tournamentRecord,
  status = PUBLIC,
  drawIds = [],
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const eventPubStatus = getEventPublishStatus({ event, status });

  const updatedSeedingScaleNames = (eventPubStatus?.seeding?.seedingScaleNames || seedingScaleNames) && {
    ...eventPubStatus?.seeding?.seedingScaleNames,
    ...seedingScaleNames,
  };

  const updatedStageSeedingScaleNames = (eventPubStatus?.seeding?.stageSeedingScaleNames || stageSeedingScaleNames) && {
    ...eventPubStatus?.seeding?.stageSeedingScaleNames,
    ...stageSeedingScaleNames,
  };

  const seeding = definedAttributes({
    stageSeedingScaleNames: updatedStageSeedingScaleNames,
    seedingScaleNames: updatedSeedingScaleNames,
    published: true,
    drawIds,
  });

  modifyEventPublishStatus({
    statusObject: { seeding },
    removePriorValues,
    status,
    event,
  });

  addNotice({
    topic: PUBLISH_EVENT_SEEDING,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      eventId: event.eventId,
      drawIds,
    },
  });

  return { ...SUCCESS };
}

export function unPublishEventSeeding({
  removePriorValues = true,
  seedingScaleNames,
  tournamentRecord,
  status = PUBLIC,
  drawIds,
  stages,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const eventPubStatus = getEventPublishStatus({ event });

  if (eventPubStatus) {
    const seeding = eventPubStatus.seeding;

    if (Array.isArray(stages) && seeding.stageSeedingScaleNames) {
      for (const stage of stages) {
        if (seeding.stageSeedingScaleNames[stage]) {
          delete seeding.stageSeedingScaleNames[stage];
        }
      }
    }

    if (Array.isArray(seedingScaleNames) && seeding?.seedingScaleNames) {
      seeding.seedingScaleNames = seeding.seedingScaleNames.filter(
        (scaleName) => !seedingScaleNames.includes(scaleName),
      );
    }

    if (Array.isArray(drawIds) && seeding?.drawIds) {
      seeding.drawIds = seeding.drawIds.filter((drawId) => !drawIds.includes(drawId));
    }

    if (
      (!Object.values(seeding.stageSeedingScaleNames ?? {}).length &&
        !seeding.seedingScaleNames?.length &&
        !seeding.drawIds?.length) ||
      (!stages && !seedingScaleNames && !drawIds?.length)
    ) {
      delete seeding.stageSeedingScaleNames;
      delete seeding.seedingScaleNames;
      delete seeding.drawIds;
      seeding.published = false;
    }

    modifyEventPublishStatus({
      statusObject: { seeding },
      removePriorValues,
      status,
      event,
    });
  }

  addNotice({
    topic: UNPUBLISH_EVENT_SEEDING,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      eventId: event.eventId,
    },
  });

  return { ...SUCCESS };
}
