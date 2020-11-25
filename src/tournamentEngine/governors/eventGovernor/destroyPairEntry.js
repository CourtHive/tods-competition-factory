import { UNPAIRED } from '../../../constants/entryStatusConstants';
import {
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT_TYPE,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ENTRY_NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import { PAIR } from '../../../constants/participantTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { addEventEntries } from './addEventEntries';
import { removeEventEntries } from './removeEventEntries';

/**
 *
 * @param {object} tournamentRecord - passed in by tournamentEngine
 * @param {string} eventId - resolved to event by tournamentEngine
 * @param {string} participantId - id of PAIR participant to remove; individualParticipantIds will be added as UNPAIRED participant entries
 *
 */
export function destroyPairEntry({ tournamentRecord, event, participantId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!event) return { error: MISSING_EVENT };
  if (event.eventType !== DOUBLES) return { error: INVALID_EVENT_TYPE };

  const tournamentParticipants = tournamentRecord.participants || [];
  const participant = tournamentParticipants.find(
    participant => participant.participantId === participantId
  );

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  if (participant.participantType !== PAIR)
    return { error: INVALID_PARTICIPANT_TYPE };

  const eventEntries = event.entries || [];
  const entry = eventEntries.find(
    entry => entry.participantId === participantId
  );
  if (!entry) return { error: PARTICIPANT_ENTRY_NOT_FOUND };

  let result = removeEventEntries({
    event,
    tournamentRecord,
    participantIds: [participantId],
  });

  if (result.error) return result;

  const individualParticipantIds = participant.individualParticipantIds;

  result = addEventEntries({
    event,
    tournamentRecord,
    entryStatus: UNPAIRED,
    entryStage: entry.entryStage,
    participantIds: individualParticipantIds,
  });

  if (result.error) console.log('addEventEntries:', { error: result.error });

  return SUCCESS;
}
