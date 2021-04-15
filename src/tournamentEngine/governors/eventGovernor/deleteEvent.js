import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';
import { addNotice } from '../../../global/globalState';

import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { AUDIT } from '../../../constants/topicConstants';
import { DELETE_EVENTS } from '../../../constants/auditConstants';

export function deleteEvents({ tournamentRecord, eventIds }) {
  if (!tournamentRecord.events) return { error: EVENT_NOT_FOUND };
  const auditTrail = [];
  const deletedEventDetails = [];

  tournamentRecord.events = (tournamentRecord.events || []).filter((event) => {
    if (eventIds.includes(event.eventId)) {
      const auditData = {
        action: DELETE_EVENTS,
        payload: { events: [event] },
      };
      auditTrail.push(auditData);
      deletedEventDetails.push({
        eventName: event.eventName,
        eventType: event.eventType,
        category: event.category,
        eventId: event.eventId,
        gender: event.gender,
      });
    }
    return !eventIds.includes(event.eventId);
  });

  if (auditTrail.length) {
    addNotice({ topic: AUDIT, payload: auditTrail });
    const timeItem = {
      itemType: DELETE_EVENTS,
      itemValue: deletedEventDetails,
    };
    addTournamentTimeItem({ tournamentRecord, timeItem });
  }

  return SUCCESS;
}
