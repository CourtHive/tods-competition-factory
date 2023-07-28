import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter/matchUpsGetter';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { getMatchUpId } from '../../../../global/functions/extractors';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import {
  addDrawNotice,
  addMatchUpsNotice,
  deleteMatchUpsNotice,
  modifyDrawNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DRAW_ID_EXISTS,
  INVALID_DRAW_DEFINITION,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';

export function addDrawDefinition({
  flight: flightDefinition,
  suppressNotifications,
  modifyEventEntries, // event.entries[{entryStatus}] are modified to match draw.entries[{entryStatus}]
  existingDrawCount,
  allowReplacement,
  checkEntryStatus, // optional boolean to enable checking that flight.drawEntries match event.entries
  tournamentRecord,
  drawDefinition,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!event) return { error: MISSING_EVENT };

  if (!event.drawDefinitions) event.drawDefinitions = [];
  const { drawId, drawName, entries: drawEntries } = drawDefinition;
  const { entries: eventEntries } = event;
  let modifiedEventEntryStatusCount = 0;

  if (
    existingDrawCount !== undefined &&
    existingDrawCount !== event.drawDefinitions.length
  )
    return { error: INVALID_VALUES, info: 'drawDefintions count mismatch' };

  const { flightProfile } = getFlightProfile({ event });
  const relevantFlight =
    flightDefinition &&
    flightProfile?.flights?.find(
      (flight) => flight.flightNumber === flightDefinition.flightNumber
    );

  // if there is a source drawId specified, the source draw must exist
  const sourceDrawId = flightProfile?.links?.find(
    (link) => link?.target?.drawId === drawId
  )?.source?.drawId;
  const sourceDrawIdError =
    sourceDrawId &&
    !event.drawDefinitions.find(
      (drawDefinition) => drawDefinition.drawId === sourceDrawId
    );

  if (sourceDrawIdError)
    return { error: MISSING_DRAW_DEFINITION, sourceDrawId };

  const flightConflict =
    relevantFlight && relevantFlight.drawId !== drawDefinition.drawId;
  if (flightConflict) {
    return { error: INVALID_DRAW_DEFINITION, relevantFlight };
  }

  const drawEntriesPresentInFlight = drawEntries.every(
    ({ participantId, entryStatus }) => {
      const flightEntry = relevantFlight?.drawEntries.find(
        (entry) => entry.participantId === participantId
      );
      return !entryStatus || flightEntry?.entryStatus === entryStatus;
    }
  );

  // check that all drawEntries have equivalent entryStatus to event.entries
  const matchingEventEntries =
    !checkEntryStatus ||
    (eventEntries &&
      drawEntries?.every(({ participantId, entryStatus, entryStage }) => {
        const eventEntry = eventEntries.find(
          (eventEntry) =>
            eventEntry.participantId === participantId &&
            (!eventEntry.entryStage || eventEntry.entryStage === entryStage)
        );
        return eventEntry?.entryStatus === entryStatus;
      }));

  if (relevantFlight && !drawEntriesPresentInFlight) {
    return decorateResult({
      result: {
        error: INVALID_DRAW_DEFINITION,
        context: {
          drawEntriesPresentInFlight,
          matchingEventEntries,
          relevantFlight,
        },
        info: 'Draw entries are not present in flight or do not match entryStatuses',
      },
    });
  }

  if (modifyEventEntries) {
    drawEntries.filter(Boolean).forEach((drawEntry) => {
      if (STRUCTURE_SELECTED_STATUSES.includes(drawEntry?.entryStatus)) {
        const eventEntry = eventEntries
          .filter(Boolean)
          .find(
            (eventEntry) => eventEntry.participantId === drawEntry.participantId
          );
        if (
          drawEntry.entryStatus &&
          eventEntry.entryStatus !== drawEntry.entryStatus
        ) {
          eventEntry.entryStatus = drawEntry.entryStatus;
          modifiedEventEntryStatusCount += 1;
        }
      }
    });
  }

  if (eventEntries && !matchingEventEntries)
    return decorateResult({
      result: {
        error: INVALID_DRAW_DEFINITION,
        context: { matchingEventEntries, eventEntries },
        info: 'Draw entries do not match event entryStatuses',
      },
    });

  const flightNumbers =
    flightProfile?.flights
      ?.map(
        ({ flightNumber }) => !isNaN(flightNumber) && parseInt(flightNumber)
      )
      ?.filter(Boolean) || [];

  const drawOrders =
    event.drawDefinitions
      .map(({ drawOrder }) => !isNaN(drawOrder) && parseInt(drawOrder))
      ?.filter(Boolean) || [];

  let drawOrder = Math.max(0, ...drawOrders, ...flightNumbers) + 1;

  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );

  let extension;
  if (flight) {
    // if this drawId was defined in a flightProfile...
    // ...update the flight.drawName with the drawName in the drawDefinition
    flight.drawName = drawDefinition.drawName;
    extension = {
      name: FLIGHT_PROFILE,
      value: {
        ...flightProfile,
        flights: flightProfile.flights,
      },
    };

    const flightNumber = flight.flightNumber;
    if (flightNumber && !drawOrders.includes(flightNumber)) {
      drawOrder = flightNumber;
    } else {
      flight.flightNumber = drawOrder;
    }
  } else {
    const flights = flightProfile?.flights || [];
    flights.push({
      manuallyAdded: true, // this drawDefinition was not part of automated split
      flightNumber: drawOrder,
      drawEntries,
      drawName,
      drawId,
    });
    extension = {
      name: FLIGHT_PROFILE,
      value: {
        ...(flightProfile || {}),
        flights,
      },
    };
  }

  addEventExtension({ event, extension });
  Object.assign(drawDefinition, { drawOrder });

  const existingDrawDefinition = event.drawDefinitions.find(
    (drawDefinition) => drawDefinition.drawId === drawId
  );
  const tournamentId = tournamentRecord?.tournamentId;
  const eventId = event.eventId;

  if (existingDrawDefinition) {
    if (!allowReplacement) {
      return { error: DRAW_ID_EXISTS };
    }
    // find matchUps added/removed
    const existingMatchUps = allDrawMatchUps({
      drawDefinition: existingDrawDefinition,
    })?.matchUps;
    const existingMatchUpIds = existingMatchUps?.map(getMatchUpId);
    const incomingMatchUps = allDrawMatchUps({
      drawDefinition,
    })?.matchUps;

    if (!suppressNotifications) {
      // all existing are deleted and then re-added to handle back-end created Id issues
      if (existingMatchUpIds?.length) {
        deleteMatchUpsNotice({
          matchUpIds: existingMatchUpIds,
          action: 'modifyDrawDefinition',
          tournamentId,
          eventId,
        });
      }
      if (incomingMatchUps?.length) {
        addMatchUpsNotice({
          matchUps: incomingMatchUps,
          tournamentId,
          eventId,
        });
      }

      // replace the existing drawDefinition with the updated version
      event.drawDefinitions = event.drawDefinitions.map((d) =>
        d.drawId === drawId ? drawDefinition : d
      );

      const structureIds = drawDefinition.structures?.map(
        ({ structureId }) => structureId
      );
      modifyDrawNotice({ drawDefinition, tournamentId, structureIds, eventId });
    }
  } else {
    event.drawDefinitions.push(drawDefinition);

    if (!suppressNotifications) {
      const { matchUps } = allDrawMatchUps({ drawDefinition, event });
      addMatchUpsNotice({
        tournamentId: tournamentRecord?.tournamentId,
        matchUps,
      });

      addDrawNotice({ drawDefinition, tournamentId, eventId });
    }
  }

  return { ...SUCCESS, modifiedEventEntryStatusCount };
}
