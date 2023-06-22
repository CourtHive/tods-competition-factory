import { checkSchedulingProfile } from '../scheduleGovernor/schedulingProfile';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';
import { addNotice } from '../../../global/state/globalState';

import { UNGROUPED } from '../../../constants/entryStatusConstants';
import { DELETE_EVENTS } from '../../../constants/auditConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DOUBLES } from '../../../constants/eventConstants';
import { AUDIT } from '../../../constants/topicConstants';
import {
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function deleteEvents({
  removePairParticipants,
  tournamentRecord,
  eventIds,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.events) return { error: EVENT_NOT_FOUND };
  if (!Array.isArray(eventIds))
    return { error: MISSING_VALUE, info: mustBeAnArray('drawIds') };

  const auditTrail = [];
  const deletedEventDetails = [];

  const activePairParticipantIds = [];
  const pairParticipantIds = [];

  tournamentRecord.events = (tournamentRecord.events || []).filter((event) => {
    if (eventIds.includes(event.eventId)) {
      const auditData = {
        action: DELETE_EVENTS,
        payload: { events: [event] },
      };
      auditTrail.push(auditData);
      deletedEventDetails.push({
        tournamentId: tournamentRecord.tournamentId,
        eventName: event.eventName,
        eventType: event.eventType,
        category: event.category,
        eventId: event.eventId,
        gender: event.gender,
      });
    }

    const enteredPairParticipantIds =
      event.eventType === DOUBLES
        ? (event.entries || [])
            .map(
              ({ entryStatus, participantId }) =>
                entryStatus !== UNGROUPED && participantId
            )
            .filter(Boolean)
        : [];

    const deleteEvent = eventIds.includes(event.eventId);

    if (deleteEvent) {
      pairParticipantIds.push(...enteredPairParticipantIds);
    } else {
      activePairParticipantIds.push(...enteredPairParticipantIds);
    }

    return !deleteEvent;
  });

  if (removePairParticipants) {
    const particiapntIdsToRemove = pairParticipantIds.filter(
      (participantId) => !activePairParticipantIds.includes(participantId)
    );
    tournamentRecord.participants = tournamentRecord.participants.filter(
      ({ participantId }) => !particiapntIdsToRemove.includes(participantId)
    );
  }

  // cleanup references to eventId in schedulingProfile extension
  checkSchedulingProfile({ tournamentRecord });

  if (auditTrail.length) {
    addNotice({ topic: AUDIT, payload: auditTrail });
    const timeItem = {
      itemType: DELETE_EVENTS,
      itemValue: deletedEventDetails,
    };
    addTournamentTimeItem({ tournamentRecord, timeItem });
  }

  return { ...SUCCESS };
}
