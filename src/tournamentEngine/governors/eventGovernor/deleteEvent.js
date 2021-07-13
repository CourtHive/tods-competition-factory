import { checkSchedulingProfile } from '../scheduleGovernor/schedulingProfile';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';
import { addNotice } from '../../../global/globalState';

import { DELETE_EVENTS } from '../../../constants/auditConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { AUDIT } from '../../../constants/topicConstants';
import {
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function deleteEvents({ tournamentRecord, eventIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.events) return { error: EVENT_NOT_FOUND };
  if (!Array.isArray(eventIds)) return { error: MISSING_VALUE };

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

  return SUCCESS;
}
