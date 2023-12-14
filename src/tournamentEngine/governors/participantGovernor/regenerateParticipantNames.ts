import { createMap, isObject } from '../../../utilities/objects';
import { formatParticipantName } from './formatParticipantName';

import { Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

/**
 * "First Last"
 * "Last, First"
 * "LAST, First"
 * "LAST, FIRST"
 * "F. Last"
 * "first last"
 * "Last"
 */

type RegenArgs = {
  formats: { [key: string]: { personFormat: string; doublesJoiner: string } }[];
  tournamentRecord: Tournament;
};

export function regenerateParticipantNames({
  tournamentRecord,
  formats,
}: RegenArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isObject(formats)) return { error: MISSING_VALUE };

  const participants = tournamentRecord.participants ?? [];

  const participantMap = createMap(participants, 'participantId');

  for (const participant of participants) {
    formatParticipantName({ participant, participantMap, formats });
  }

  return { ...SUCCESS };
}
