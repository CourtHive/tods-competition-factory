import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { getTopics } from '../../../../global/state/globalState';
import {
  addDrawNotice,
  addMatchUpsNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { VOLUNTARY_CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { ADD_MATCHUPS } from '../../../../constants/topicConstants';
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
  checkEntryStatus = true,
  modifyEventEntries, // event.entries[{entryStatus}] are modified to match draw.entries[{entryStatus}]
  existingDrawCount,
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

  const drawDefinitionExists = !!event.drawDefinitions.find(
    (drawDefinition) => drawDefinition.drawId === drawId
  );

  if (drawDefinitionExists) return { error: DRAW_ID_EXISTS };

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

  // check relevantFlight.drawEntries are equivalent to drawEntries
  const matchingFlighEntries = relevantFlight?.drawEntries.every(
    ({ participantId, entryStatus }) => {
      const drawEntry = drawEntries.find(
        (drawEntry) => drawEntry && drawEntry.participantId === participantId
      );
      return !entryStatus || drawEntry?.entryStatus === entryStatus;
    }
  );

  // check that all drawEntries have equivalent entryStatus to event.entries
  const matchingEventEntries =
    !checkEntryStatus ||
    (eventEntries &&
      drawEntries?.every(({ participantId, entryStatus, entryStage }) => {
        const eventEntry = eventEntries.find(
          (eventEntry) => eventEntry.participantId === participantId
        );
        const isVoluntaryConsolation =
          relevantFlight?.stage === VOLUNTARY_CONSOLATION &&
          entryStage === VOLUNTARY_CONSOLATION;
        return (
          isVoluntaryConsolation || eventEntry?.entryStatus === entryStatus
        );
      }));

  if (relevantFlight && !matchingFlighEntries) {
    return {
      error: INVALID_DRAW_DEFINITION,
      matchingEventEntries,
      relevantFlight,
    };
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
    return {
      error: INVALID_DRAW_DEFINITION,
      matchingEventEntries,
      eventEntries,
    };

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
  event.drawDefinitions.push(drawDefinition);

  const { topics } = getTopics();
  if (topics.includes(ADD_MATCHUPS)) {
    const { matchUps } = allDrawMatchUps({ drawDefinition, event });
    addMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUps,
    });
  }

  addDrawNotice({ drawDefinition });

  return { ...SUCCESS, modifiedEventEntryStatusCount };
}
