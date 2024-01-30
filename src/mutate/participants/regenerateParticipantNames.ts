import { createMap, isObject } from '../../tools/objects';
import { formatParticipantName } from '../../assemblies/generators/participants/formatParticipantName';

import { Tournament } from '../../types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { MISSING_TOURNAMENT_RECORD, MISSING_VALUE } from '@Constants/errorConditionConstants';

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

export function regenerateParticipantNames({ tournamentRecord, formats }: RegenArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isObject(formats)) return { error: MISSING_VALUE };

  const participants = tournamentRecord.participants ?? [];

  const participantMap = createMap(participants, 'participantId');

  for (const participant of participants) {
    formatParticipantName({ participant, participantMap, formats });
  }

  return { ...SUCCESS };
}
